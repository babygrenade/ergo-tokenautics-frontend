$(document).ready(function(){
  $.ajax({
    type: "GET",
    url: 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/master/token_list.csv',
    dataType: 'text',
    success: function(data) {getList(data);}
  });
});

function getList(data){
  var allRows = data.split(/\r?\n|\r/);
  var selectList = '';
  for (var singleRow = 0; singleRow < allRows.length; singleRow++){
    var rowCells = allRows[singleRow].split(',');
    var newItem = '<option id = "'+rowCells[0]+'" value ="' + rowCells[0] + '" >' + rowCells[0] + '</option>';
    selectList += newItem;
  }
  document.getElementById("tokenList").innerHTML = selectList;
  try{
    parameterToken = getParameter();
    document.getElementById(parameterToken).selected = "selected";
  } catch (error){
    console.error(error);
  }
  selectToken();
}

function getParameter() {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var token = urlParams.get('token');
  return token;
}

function setParameter(param, newval) {
  search = window.location.search;
  var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
  var query = search.replace(regex, "$1").replace(/&$/, '');
  parameterString = (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
  urlPath = window.location.pathname + parameterString;
  window.history.replaceState("","Ergo Tokenautics", urlPath);
}

function selectToken() {
  //chart.destroy();
  $('#chart').remove();
  $('#chart-wrapper').append('<canvas id="chart"><canvas>');
  var tokenList = document.getElementById("tokenList");
  var selectedToken = tokenList.options[tokenList.selectedIndex].text;
  var selectedTokenId = tokenList.options[tokenList.selectedIndex].id;
  document.getElementById("titleToken").textContent = selectedToken;
  setParameter('token',selectedToken);
  var tokenInfoUrl = 'https://api.ergoplatform.com/api/v1/tokens/' + selectedTokenId;
  var csv = 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/master/data/' + selectedToken + '.csv'
  document.getElementById("download").href = csv;
  d3.csv(csv).then(makeChart);
}

async function getTokenDetails(){
  var tokenList = document.getElementById("tokenList");
  var selectedTokenId = tokenList.options[tokenList.selectedIndex].id;
  var tokenInfoUrl = 'https://api.ergoplatform.com/api/v1/tokens/' + selectedTokenId;
  const response = await fetch(tokenInfoUrl);
  const tokenInfo = await response.json();
  console.log(tokenInfo);
  return tokenInfo;
}

function showSummary(data){
  var addressData = data.map(function(d) {return d.address});
  var percentageData = data.map(function(d) {return d.percentage*100});
  var amountData = data.map(function(d) {return d.amount});
  var totalSupply = d3.sum(amountData);
  var contractList = [];
  contractList.push(0);
  for (var i=0; i < data.length; i++){
    if (addressData[i].length > 51){
      var amt= amountData[i];
      contractList.push(amt);
    }
  }

  var totalLocked = d3.sum(contractList);
  var line1 = "Total Supply: " + totalSupply; 
  var line2 = "Total Locked: " + totalLocked;
  summary = line1 +'\r\n'+ line2;
  document.getElementById("summary").setAttribute('style', 'white-space: pre;');
  document.getElementById("summary").textContent = summary;
  return totalSupply
}

function makeChart(data) {
  showSummary(data);
  if (document.getElementById("pop_top").checked == true){
    data = data.slice(1);
  }

  if (data.length > 100){
    addresses = data.slice(0,99);
  }
  else{
    addresses = data
  }
  var addressLabels = addresses.map(function(d) {return d.address});
  var percentageData = addresses.map(function(d) {return d.percentage*100});
  var amountData = addresses.map(function(d) {return d.amount});
  var fullAmt = data.map(function(d) {return d.amount});
  var totalSupply = d3.sum(fullAmt);
  var shortLabels = [];
  for ( var i = 0; i < addressLabels.length; i++){
    if (addressLabels[i].length > 51){
      var shortLabel = addressLabels[i].slice(0,50) + '...';
      shortLabels.push(shortLabel);
    } else {
      shortLabels.push(addressLabels[i]);
    }
  }
  var ctx = document.getElementById('chart');
  ctx.height = addressLabels.length * 20;
  var chart = new Chart(ctx, {
    type: 'horizontalBar',
    options: {
       responsive: true,
       maintainAspectRatio: false,
       barThickness: 0.9,
       scales: {
            x: {
                grid: {
                  offset: true
                }
            },
        
        },
       legend: {
        display: false
      },
      tooltips: {
        //mode: 'index',
        callbacks: {
          title: function(t,d){
            return addressLabels[t[0].index];
          },
          afterLabel: function(t, d){
            //var percent = "Percent: " + percentageData[t.index] + "%"
            percent = +(amountData[t.index] * 100/ totalSupply).toFixed(3);
            var percent_text = "Percent: " + percent + "%";
           return percent_text;
          }
        }
      },
      parsing: {
        key: 'nested.value'
      }
    },
    data: {
      labels: shortLabels,
      longLabels: addressLabels,
      datasets: [
        {
          label:'Amount',
          data:amountData,
          backgroundColor:'#ff6384'
        }
      ]
    }
  });
  document.getElementById("chart").onclick = function(evt){
    var activePoints = chart.getElementsAtEvent(evt);
    var firstPoint = activePoints[0];
    var contextUrl = 'https://explorer.ergoplatform.com/en/addresses/' + chart.data.longLabels[firstPoint._index] ;
    if (firstPoint !== undefined)
        window.open(contextUrl, '_blank');
  }
}

