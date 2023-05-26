function showSummary(data) {
    var addressData = data.map(function (d) {
        return d.address;
    });
    var percentageData = data.map(function (d) {
        return d.percentage * 100;
    });
    var amountData = data.map(function (d) {
        return d.amount;
    });
    var decimalDivisor = getDecimal();
    var totalSupply = d3.sum(amountData) / decimalDivisor;
    console.log("Total Supply:", totalSupply);

    // Separate contract and non-contract holders
    var contractHolders = [];
    var nonContractHolders = [];
    for (var i = 0; i < data.length; i++) {
        var address = addressData[i];
        var amount = amountData[i];
        if (address.charAt(0) === '9') {
            
            nonContractHolders.push({ address: address, amount: amount });
        } else {
            contractHolders.push({ address: address, amount: amount });
        }
    }
    

    // Sort non-contract holders in descending order by amount
    nonContractHolders.sort(function (a, b) {
        return b.amount - a.amount;
    });
    console.log(contractHolders,'contractHolders')
    console.log("Decimal Divisor:", decimalDivisor);

    var totalLocked = d3.sum(contractHolders, function (d) {
        return d.amount;
    }) / decimalDivisor;
    console.log("Total Locked:", totalLocked);
    
    var totalInContracts = d3.sum(contractHolders, function (d) {
        return d.amount;
    }) / decimalDivisor;
    console.log("Total In Contracts:", totalInContracts);
    
    var lockedPercentage = ((totalLocked / totalSupply) * 100).toFixed(2);
    console.log("Locked Percentage:", lockedPercentage);

    var sortedNonContractPercentageData = [];
    for (var i = 0; i < data.length; i++) {
        if (!addressData[i].startsWith('9')) continue;
        sortedNonContractPercentageData.push(percentageData[i]);
    }

    sortedNonContractPercentageData.sort(function (a, b) {
        return b - a;
    });

    var percentageOfTopHolders = d3.sum(sortedNonContractPercentageData.slice(0, 10)).toFixed(2);
    console.log("Percentage of Top Holders:", percentageOfTopHolders);

    var averageHolding = (totalSupply / addressData.length).toFixed(2);
    console.log("Average Holding:", averageHolding);

    // Calculate Token Circulation
    var tokenCirculation = (totalSupply - totalLocked).toFixed(2);
    console.log("Token Circulation:", tokenCirculation);

    var tokenAPIUrl = 'https://api.ergo.watch/tokens/472c3d4ecaa08fb7392ff041ee2e6af75f4a558810a74b28600549d5392810e8/supply';

    fetch(tokenAPIUrl)
        .then(response => response.json())
        .then(tokenInfo => {
            var emittedSupply = tokenInfo.emitted;
            var inP2PKsSupply = tokenInfo.in_p2pks;
            var inContractsSupply = tokenInfo.in_contracts;
            var burnedSupply = tokenInfo.burned;

            // Calculate total supply (emitted supply minus burned supply)
            var totalSupply = emittedSupply - burnedSupply;
            console.log("Total Supply:", totalSupply);

            console.log(inP2PKsSupply, 'inP2PKsSupply')
            console.log(burnedSupply, 'burnedSupply')
            var circulatingSupply = inP2PKsSupply - burnedSupply;
            console.log(circulatingSupply, 'circulatingSupply')
            // Add the token information to the summary
            var line10 = "Emitted Supply: " + formatNumberWithCommas(emittedSupply);
            var line11 = "In P2PKs Supply: " + formatNumberWithCommas(inP2PKsSupply);
            var line12 = "In Contracts Supply: " + formatNumberWithCommas(inContractsSupply);
            var line13 = "Burned Supply: " + formatNumberWithCommas(burnedSupply);
            var line14 = "Total Supply: " + formatNumberWithCommas(totalSupply);
            //var line15 = "Circulating Supply: " + formatNumberWithCommas(circulatingSupply);

            summary += "\r\n" + line10 + "\r\n" + line11 + "\r\n" + line12 + "\r\n" + line13 + "\r\n" + line14;// + "\r\n" + line15;
            console.log("Summary:", summary);

            // Update the summary element with the additional information
            document.getElementById("summary").textContent = summary;
        })
        .catch(error => {
            console.error('Error fetching token information:', error);
        });

    var line1 = "Total Locked: " + totalLocked + " (" + lockedPercentage + "%)";
    var line2 = "Top ten wallets hold " + percentageOfTopHolders + "%";
    var line3 = "Average Holding: " + averageHolding;

    summary = line1 + "\r\n" + line2 + "\r\n" + line3;
    document.getElementById("summary").setAttribute("style", "white-space: pre;");
    document.getElementById("summary").textContent = summary;
    return totalSupply;
}
