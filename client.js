var viewport = document.getElementById("viewport");

var snapshot = document.getElementById("snapshot");
var snapshotContext = snapshot.getContext("2d");

var overlay = document.getElementById("overlay");
var overlayContext = overlay.getContext("2d");

function handleVideo(stream) {
  viewport.src = window.URL.createObjectURL(stream);
}

function snapIt(event) {
  snapshotContext.drawImage(viewport, 0, 0, snapshot.width, snapshot.height);

  overlayContext.clearRect(0, 0, overlay.width, overlay.height);
  var messages = new Array();
  messages[0] = {time: 0, text: "PERSON", x: 90, y: 200};
  messages.forEach(function(message) {
    overlayContext.font = "22px Lato";
    overlayContext.fillStyle = "#000000";
    overlayContext.fillText(message.text, message.x, message.y);
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
