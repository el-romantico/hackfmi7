/**
 * Video and canvas elements.
 */
var viewport = document.getElementById("viewport");
var snapshot = document.getElementById("snapshot");
var snapshotContext = snapshot.getContext("2d");
var overlay = document.getElementById("overlay");
var overlayContext = overlay.getContext("2d");

/**
 * General purpose variables.
 */
var height = viewport.height;
var width = viewport.width;

/**
 * Label movement configuration.
 */
var maxCaptionsCount = 100;
var prevCaptionCoordinates = new Float32Array(maxCaptionsCount * 2);
var captionCoordinates = new Float32Array(maxCaptionsCount * 2);
var captionStatuses = new Uint8Array(maxCaptionsCount);
var captionsCount = 0;
var captionLabels = [];
var imagePyramid = new jsfeat.pyramid_t(3);
var prevImagePyramid = new jsfeat.pyramid_t(3);
imagePyramid.allocate(width, height, jsfeat.U8_t | jsfeat.C1_t);
prevImagePyramid.allocate(width, height, jsfeat.U8_t | jsfeat.C1_t);
var winSize = 20;
var maxIterations = 30;
var epsilon = 0.01;
var minEigen = 0.001;

function createCaption(text, x, y) {
  overlayContext.font = "22px Lato";
  overlayContext.fillStyle = "#000000";
  overlayContext.fillText(text, x, y);
}

// Extracts a still image from the video stream.
function snapIt(event) {
  snapshotContext.drawImage(viewport, 0, 0, snapshot.width, snapshot.height);

  prevCaptionCoordinates = new Float32Array(maxCaptionsCount * 2);
  captionCoordinates = new Float32Array(maxCaptionsCount * 2);
  captionStatuses = new Uint8Array(maxCaptionsCount);
  captionsCount = 0;
  captionLabels = [];

  var messages = new Array();
  messages[0] = {text: "PERSON", x: 90, y: 200};
  messages[1] = {text: "BANANA", x: 390, y: 200};
  messages.forEach(function(message) {
    createCaption(message.text, message.x, message.y);

    captionLabels[captionsCount] = message.text;
    captionCoordinates[captionsCount << 1] = message.x;
    captionCoordinates[(captionsCount << 1) + 1] = message.y;
    captionsCount++;
  });
}

/**
 * Add camera stream to viewport.
 */
navigator.webkitGetUserMedia(
    {video: true},
    function(stream) { viewport.src = window.URL.createObjectURL(stream); },
    function() {});

/**
 * Follow caption movements.
 */
function tick() {
  compatibility.requestAnimationFrame(tick);

  if (viewport.readyState === viewport.HAVE_ENOUGH_DATA) {
    overlayContext.drawImage(viewport, 0, 0, width, height);
    var imageData = overlayContext.getImageData(0, 0, width, height);

    var _pt_xy = prevCaptionCoordinates;
    prevCaptionCoordinates = captionCoordinates;
    captionCoordinates = _pt_xy;
    var _pyr = prevImagePyramid;
    prevImagePyramid = imagePyramid;
    imagePyramid = _pyr;

    jsfeat.imgproc.grayscale(
        imageData.data, width, height, imagePyramid.data[0]);

    imagePyramid.build(imagePyramid.data[0], true);

    jsfeat.optical_flow_lk.track(
        prevImagePyramid, imagePyramid, prevCaptionCoordinates,
        captionCoordinates, captionsCount, winSize | 0, maxIterations | 0,
        captionStatuses, epsilon, minEigen);

    var updatedCaptionsCount = 0;

    for (var i = 0; i < captionsCount; ++i) {
      if (captionStatuses[i] == 1) {
        if (updatedCaptionsCount < i) {
          captionLabels[updatedCaptionsCount] = captionLabels[i];
          captionCoordinates[updatedCaptionsCount << 1] =
              captionCoordinates[i << 1];
          captionCoordinates[(updatedCaptionsCount << 1) + 1] =
              captionCoordinates[(i << 1) + 1];
        }
        createCaption(
            captionLabels[updatedCaptionsCount],
            captionCoordinates[updatedCaptionsCount << 1],
            captionCoordinates[(updatedCaptionsCount << 1) + 1]);
        ++updatedCaptionsCount;
      }
    }
    captionsCount = updatedCaptionsCount;
  }
}
compatibility.requestAnimationFrame(tick);
