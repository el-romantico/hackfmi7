var snapshot = document.getElementById("snapshot");
var snapshotContext = snapshot.getContext("2d");

var viewport = document.querySelector("#viewport");

function handleVideo(stream) {
  viewport.src = window.URL.createObjectURL(stream);
}

function snapIt(event) {
  snapshotContext.drawImage(viewport, 0, 0, snapshot.width, snapshot.height);

  var messages = new Array();
  messages[0] = {time: 0, text: "PERSON", x: 90, y: 200};
  messages.forEach(function(message) {
    snapshotContext.font = "22px Lato";
    snapshotContext.fillStyle = "#000000";
    snapshotContext.fillText(message.text, message.x, message.y);
  });

  var image = snapshot.toDataURL();
  console.log(image);

  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      var myArr = JSON.parse(request.responseText);
      console.log(myArr.results[0].tags[0].tag);
    }
  };
  request.open("GET", "http://127.0.0.1:3000/analyze", true);
  request.setRequestHeader('Accept', 'application/json');
  request.send();
}

navigator.webkitGetUserMedia({video: true}, handleVideo, function() {});
