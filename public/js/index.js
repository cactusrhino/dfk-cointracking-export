function submitAddress() {
  var cointracking = [];
  var quests = [];

  console.log("click");
  document.getElementById("loading").style = "visbility: visible";
  postData("http://127.0.0.1:3030/scan", {
    address: document.getElementById("addressInput").value,
  }).then((data) => {
    // exportCSVFile(
    //   {
    //     type: "",
    //     buy: "",
    //     bCurr: "",
    //     sell: "",
    //     sCurr: "",
    //     fee: "",
    //     fCurr: "",
    //     exchange: "",
    //     comments: "",
    //     group: "",
    //     timestamp: "",
    //   },
    //   data.log,
    //   "dfkexport"
    // );
    document.getElementById("loading").style = "visbility: hidden";
    var csv = Papa.unparse(data.log);
    document.getElementById("skipped").innerHTML =
      "These transactions were skipped. This app isn't smart enough for them (...yet) \n" +
      data.skipped;
    exportCSVFile(csv, "dfklog");

    console.log(csv);
  });
}

// var contracts;
// getData("http://127.0.0.1:3030/contracts").then((res) => {
//   document.getElementById("submit").disabled = false;
//   contracts = res;
// });

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
async function getData(url = "") {
  const response = await fetch(`${url}`, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function convertToCSV(objArray) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  return str;
}

function exportCSVFile(csvParse, fileTitle) {
  var csv = csvParse;

  var exportedFilenmae = fileTitle + ".csv" || "export.csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilenmae);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
