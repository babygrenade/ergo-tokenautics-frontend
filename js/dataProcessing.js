function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
    //document.getElementsByClassName('dropdown-content')[1].innerHTML = commitsList;
    try{
      parameterCommit = getParameter('commit');
      document.getElementById(parameterCommit).selected = "selected";
    } catch (error){
      console.error(error);
    }
    selectToken();
  }
  
  
  function getList(data){
    var allRows = data.split(/\r?\n|\r/);
    var selectList = '';
    for (var singleRow = 0; singleRow < allRows.length; singleRow++){
      var rowCells = allRows[singleRow].split(',');
      //var newItem = '<option id = "'+rowCells[1]+'" value ="' + rowCells[0] +'" data-token-id='+ rowCells[1] + ' >' + rowCells[0] + '</option>';
      var newItem = '<option id = "'+rowCells[1]+'" value ="' + rowCells[0] +'" data-decimal='+ rowCells[2] + ' >' + rowCells[0] + '</option>';
      selectList += newItem;
    }

    console.log(selectList);
    
    //old
    document.getElementById("tokenList").innerHTML = selectList;


    try{
      parameterToken = getParameter('token');
      document.getElementById(parameterToken).selected = "selected";
    } catch (error){
      console.error(error);
    }
  }


function selectToken() {
    //chart.destroy();
    $('#chart').remove();
    $('#chart-wrapper').append('<canvas id="chart"><canvas>');
    var tokenList = document.getElementById("tokenList");
    var selectedToken = tokenList.options[tokenList.selectedIndex].text;
    var selectedTokenId = tokenList.options[tokenList.selectedIndex].id;
    document.getElementById("titleToken").textContent = selectedToken;
  
    var commitList = document.getElementById("snapshotList");
    var selectedCommitId = commitList.options[commitList.selectedIndex].id;
    setParameter('token',selectedToken);
    
    if(selectedCommitId){
      setParameter('commit',selectedCommitId);
      var csv = 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/'+ selectedCommitId +'/data/' + selectedToken + '.csv';
    }
    else{
      var csv = 'https://raw.githubusercontent.com/babygrenade/ergo-tokenautics/master/data/' + selectedToken + '.csv';
    }
    document.getElementById("download").href = csv;
    d3.csv(csv).then(makeChart);
  }

function getDecimal(){
    var tokenList = document.getElementById("tokenList");
    var decimal = tokenList.options[tokenList.selectedIndex].getAttribute("data-decimal");
    var decimalDivisor = Math.pow(10,decimal);
    return decimalDivisor;
  }