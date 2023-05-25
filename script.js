$(document).ready(function(){
  $.ajax({
    type: "GET",
    url: 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/master/token_list.csv',
    dataType: 'text',
    success: function(data) {getList(data);}
  });
  $.ajax({
    type: "GET",
    url: 'https://api.github.com/repos/babygrenade/ergo-tokenautics/commits?per_page=100',
    dataType: 'json',
    success: function(data) {getCommits(data);}
  });
});
var excludecontracts = true;

function getCommits(data){
  commits = data.map(function(d) {if(d.commit.message.substring(0,11) == 'Data update') {return d.sha}});
  timestamps = data.map(function(d) {if(d.commit.message.substring(0,11) == 'Data update') {return d.commit.author.date}})
  commits = commits.filter(n => n);
  timestamps = timestamps.filter(n => n);
  commitsList = '';
  for (var i = 0; i < commits.length; i++){
    var newItem = '<option id = "'+commits[i]+'" value ="' + commits[i] + '" >' + timestamps[i] + '</option>';
    commitsList += newItem;
  }
  document.getElementById("snapshotList").innerHTML = commitsList;
  try{
    parameterCommit = getParameter('commit');
    document.getElementById(parameterCommit).selected = "selected";
  } catch (error){
    console.error(error);
  }
  selectToken();
}
function getList(data, selectedTokenId, selectedCommitId) {
  var allRows = data.split(/\r?\n|\r/);
  var selectList = '';
  for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
    var rowCells = allRows[singleRow].split(',');
    var newItem = '<option id="' + rowCells[0] + '" value="' + rowCells[0] + '" data-decimal=' + rowCells[2] + '>' + rowCells[0] + '</option>';
    selectList += newItem;
  }
  $('#tokenList').html(selectList);

  try {
    if (selectedTokenId) {
      var tokenList = document.getElementById("tokenList");
      var options = tokenList.options;
      for (var i = 0; i < options.length; i++) {
        if (options[i].id === selectedTokenId) {
          tokenList.selectedIndex = i;
          break;
        }
      }
      // Reinitialize the Materialize select element
      var instance = M.FormSelect.getInstance(tokenList);
      if (!instance) {
        M.FormSelect.init(tokenList);
      } else {
        instance.destroy();
        M.FormSelect.init(tokenList);
      }
    }
  } catch (error) {
    console.error(error);
  }

  if(!selectedTokenId || !selectedCommitId) {
      console.log("TokenId or CommitId is not defined");
      return; // Or assign some default values
  }
  $.ajax({
      type: "GET",
      url: 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/master/token_list.csv',
      dataType: 'text',
      success: function (data) {
          getChartData(data, selectedTokenId, selectedCommitId);
      }
  });
}
function getChartData(data, selectedTokenId, selectedCommitId) {
  var csv;
  if (selectedCommitId) {
    setParameter('commit', selectedCommitId);
    csv = 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/' + selectedCommitId + '/data/' + selectedTokenId + '.csv';
  } else {
    csv = 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/master/data/' + selectedTokenId + '.csv';
  }
  
  document.getElementById("download").href = csv;

  $.ajax({
    type: "GET",
    url: csv,
    dataType: 'text',
    success: function (data) {
      makeChart(data);
    }
  });
}


function getParameter(param) {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var value = urlParams.get(param);
  return value;
}

function setParameter(param, newval) {
  search = window.location.search;
  var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
  var query = search.replace(regex, "$1").replace(/&$/, '');
  parameterString = (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
  urlPath = window.location.pathname + parameterString;
  window.history.replaceState("","Ergo Tokenautics", urlPath);
}

function togglecontracts() {
  excludecontracts = !excludecontracts; // Toggle the excludecontracts variable
  selectToken(); // Re-run the selectToken() function to update the chart
}

function selectToken() {
  console.log("Select Token Function");
  //chart.destroy();
  $('#chart').remove();
  $('#chart-wrapper').append('<canvas id="chart"><canvas>');
  var tokenList = document.getElementById("tokenList");
  console.log("Token List:", tokenList);
  var selectedToken = tokenList.options[tokenList.selectedIndex].text;
  console.log("Selected Token:", selectedToken);
  var selectedTokenId = (tokenList.selectedIndex >= 0) ? tokenList.options[tokenList.selectedIndex].id : undefined;
  console.log("Selected Token ID:", selectedTokenId);
  document.getElementById("titleToken").textContent = selectedToken;

  var commitList = document.getElementById("snapshotList");
  var selectedCommitId = commitList.options[commitList.selectedIndex].id;
  console.log("Selected Commit ID:", selectedCommitId);
  setParameter('token', selectedToken);

  if (selectedTokenId) {
    $.ajax({
      type: "GET",
      url: 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/master/token_list.csv',
      dataType: 'text',
      success: function (data) {
        getList(data, selectedTokenId, selectedCommitId);
      }
    });
  } else {
    // Handle the case where no token is selected
    console.error('No token is selected');
  }
}



function getDecimal(){
  var tokenList = document.getElementById("tokenList");
  var decimal = tokenList.options[tokenList.selectedIndex].getAttribute("data-decimal");
  var decimalDivisor = Math.pow(10,decimal);
  return decimalDivisor;
}

function showSummary(data){
  var addressData = data.map(function(d) {return d.address});
  var percentageData = data.map(function(d) {return d.percentage*100});
  var amountData = data.map(function(d) {return d.amount});
  var decimalDivisor = getDecimal()
  var totalSupply = d3.sum(amountData)/decimalDivisor;
  var contractList = [];
  contractList.push(0);
  for (var i=0; i < data.length; i++){
    if (addressData[i].length > 51){
      var amt= amountData[i];
      contractList.push(amt);
    }
  }


  var totalLocked = d3.sum(contractList)/decimalDivisor;
  var line1 = "Total Supply: " + totalSupply; 
  var line2 = "Total Locked: " + totalLocked;
  summary = line1 +'\r\n'+ line2;
  document.getElementById("summary").setAttribute('style', 'white-space: pre;');
  document.getElementById("summary").textContent = summary;
  return totalSupply
}
function makeChart(csvData) {
  var data = d3.csvParse(csvData);

  showSummary(data);

  if (document.getElementById("pop_top").checked == true) {
    data = data.slice(1);
  }

  if (excludecontracts) {
    data = data.filter(function (d) {
      return d.address.startsWith('9');
    });
  }

  if (data.length > 100) {
    data = data.slice(0, 100);
  }

  var addressLabels = data.map(function (d) {
    return d.address;
  });
  var percentageData = data.map(function (d) {
    return d.percentage * 100;
  });
  var decimalDivisor = getDecimal();
  var amountData = data.map(function (d) {
    return d.amount;
  });
  var fullAmt = data.map(function (d) {
    return d.amount;
  });
  var totalSupply = d3.sum(fullAmt);
  var shortLabels = [];
  for (var i = 0; i < addressLabels.length; i++) {
    if (addressLabels[i].length > 51) {
      var shortLabel = addressLabels[i].slice(0, 50) + '...';
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
        callbacks: {
          title: function (t, d) {
            return addressLabels[t[0].index];
          },
          label: function (t, d) {
            decimalAmount = amountData[t.index] / decimalDivisor;
            return decimalAmount;
          },
          afterLabel: function (t, d) {
            percent = +(amountData[t.index] * 100 / totalSupply).toFixed(3);
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
      datasets: [{
        label: 'Amount',
        data: amountData,
        backgroundColor: '#ff6384'
      }]
    }
  });

  document.getElementById("chart").onclick = function (evt) {
    var activePoints = chart.getElementsAtEvent(evt);
    var firstPoint = activePoints[0];
    var contextUrl = 'https://explorer.ergoplatform.com/en/addresses/' + chart.data.longLabels[firstPoint._index];
    if (firstPoint !== undefined)
      window.open(contextUrl, '_blank');
  }
}
