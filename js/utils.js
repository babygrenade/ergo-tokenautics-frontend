

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
    window.history.replaceState("", "Ergo Tokenautics", urlPath);
}

function togglecontracts() {
    excludecontracts = !excludecontracts; // Toggle the excludecontracts variable
    selectToken(); // Re-run the selectToken() function to update the chart
}

function getDecimal() {
    var tokenList = document.getElementById("tokenList");
    console.log("tokenList:", tokenList);
    var decimal = tokenList.options[tokenList.selectedIndex].getAttribute("data-decimal");
    console.log("decimal:", decimal);
    var decimalDivisor = Math.pow(10, decimal);
    console.log("decimalDivisor:", decimalDivisor);
    return decimalDivisor;
}
