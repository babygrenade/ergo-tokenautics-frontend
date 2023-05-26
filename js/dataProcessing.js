function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCommits() {
    var page = 1;
    var commits = [];
  
    function fetchCommits() {
      fetch(`https://api.github.com/repos/glasgowm148/ergo-tokenautics/commits?per_page=100&page=${page}`)
        .then(response => response.json())
        .then(data => {
          commits = commits.concat(data.map(commit => ({
            sha: commit.sha,
            timestamp: commit.commit.author.date
          })));
  
          if (data.length === 100) {
            // Fetch next page if there are more commits
            page++;
            fetchCommits();
          } else {
            populateCommitsDropdown();
          }
        })
        .catch(error => {
          console.error('Error fetching commits:', error);
        });
    }
  
    function populateCommitsDropdown() {
      var commitsList = '';
      for (var i = 0; i < commits.length; i++) {
        var newItem = `<option id="${commits[i].sha}" value="${commits[i].sha}">${commits[i].timestamp}</option>`;
        commitsList += newItem;
      }
  
      document.getElementById("snapshotList").innerHTML = commitsList;
  
      // Initialize event listener for snapshot selection
      $('#snapshotList').on('change', function () {
        var selectedCommitId = $(this).val();
        selectToken(null, selectedCommitId); // Pass the selected commit ID to the selectToken function
      });
  
      // Get the selected token and commit IDs
      var selectedTokenId = getParameter('token');
      var selectedCommitId = getParameter('commit') || commits[0].sha; // Use the first commit SHA if no commit is already selected
  
      selectToken(selectedTokenId, selectedCommitId);
    }
  
    fetchCommits();
  }
  
function getList(data, selectedTokenId, selectedCommitId) {
    var allRows = data.split(/\r?\n|\r/);
    console.log(allRows, 'allRows')
    var selectList = '';
    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
        
        var rowCells = allRows[singleRow].split(',');
        console.log(rowCells[2], 'rowCells[2]')
        var newItem = '<option id="' + rowCells[0] + '" value="' + rowCells[0] + '" data-decimal=' + rowCells[2] + '>' + rowCells[0] + '</option>';
        selectList += newItem;
    }

    $('#tokenList').html(selectList);

    try {
        if (!selectedTokenId || !selectedCommitId) {
            console.log("TokenId or CommitId is not defined");
            return;
        }

        if (selectedTokenId) {
            var tokenList = document.getElementById("tokenList");
            var options = tokenList.options;
            for (var i = 0; i < options.length; i++) {
                if (options[i].id === selectedTokenId) {
                    tokenList.selectedIndex = i;
                    break;
                }
            }

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

    if (!selectedTokenId || !selectedCommitId) {
        console.log("TokenId or CommitId is not defined");
        return;
    }
    $.ajax({
        type: "GET",
        url: 'https://raw.githubusercontent.com/glasgowm148/ergo-tokenautics/master/token_list.csv',
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
        csv = 'https://raw.githubusercontent.com/glasgowm148/ergo-tokenautics/' + selectedCommitId + '/data/' + selectedTokenId + '.csv';
        console.log("CSV:", csv)
    } else {
        csv = 'https://raw.githubusercontent.com/glasgowm148/ergo-tokenautics/master/data/' + selectedTokenId + '.csv';
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

function selectToken(selectedTokenId, selectedCommitId) {
    $('#chart').remove();
    $('#chart-wrapper').append('<canvas id="chart"></canvas>');
    var tokenList = document.getElementById("tokenList");
    var selectedToken = tokenList.options[tokenList.selectedIndex].text;
    var selectedTokenId = tokenList.options[tokenList.selectedIndex].id;
    document.getElementById("titleToken").textContent = selectedToken;

    var commitList = document.getElementById("snapshotList");
    var selectedCommitId = commitList.options[commitList.selectedIndex].id;
    setParameter('token', selectedToken);

    if (selectedTokenId) {
        $.ajax({
            type: "GET",
            url: 'https://raw.githubusercontent.com/glasgowm148/ergo-tokenautics/master/token_list.csv',
            dataType: 'text',
            success: function (data) {
                getList(data, selectedTokenId, selectedCommitId);
            }
        });
    } else {
        console.error('No token is selected');
    }
}


