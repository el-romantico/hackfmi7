var express = require('express');
var app = express();
var http = require('http');

app.use('/', express.static(__dirname));

app.post('/analyze', function(req, res) {
  var imageAsBase64 = '';
  req.on('data', function(chunk) {
    console.log("here");
    imageAsBase64 += chunk;
  });
  req.on('end', function() {
    var image = imageAsBase64.replace(/^data:image\/png;base64,/, "");
    require("fs").writeFile("out.png", image, 'base64', function(err) {
      console.log(err); // writes out file without error, but it's not a valid image
    });

    res.send();
  });

  // var options = {
  //     host: 'api.imagga.com',
  //     path:
  //         '/v1/tagging?url=http://imagga.com/static/images/tagging/wind-farm-538576_640.jpg',
  //     headers: {
  //       'Authorization':
  //           'Basic YWNjX2YxNGFjNGNkZDNhZjA3Mzo2ZGE4ZWE4MWQ3YjQyM2IyNWRmZTJiNDhmYTdjYWRlYw=='
  //     }
  //   };


  // var req = http.request(options, function(response) {

  // });
  // req.end();
});

app.listen(3000);
