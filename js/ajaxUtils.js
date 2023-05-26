function getListData() {
    $.ajax({
      type: "GET",
      url: 'https://raw.githubusercontent.com/glasgowm148/ergo-tokenautics/master/token_list.csv',
      dataType: 'text',
      success: function(data) {
        getList(data);
      }
    });
  }
  
  function getCommitData() {
    $.ajax({
      type: "GET",
      url: 'https://api.github.com/repos/glasgowm148/ergo-tokenautics/commits?per_page=100',
      dataType: 'json',
      success: function(data) {
        getCommits(data);
      }
    });
  }
  
  function getChartData(selectedTokenId, selectedCommitId) {
    $.ajax({
        type: "GET",
        url: 'https://raw.githubusercontent.com/glasgowm148/ergo-tokenautics/master/token_list.csv',
        dataType: 'text',
        success: function (data) {
            processData(data, selectedTokenId, selectedCommitId);
        }
    });
  }
  