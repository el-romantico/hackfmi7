var express = require('express');
var app = express();
var http = require('http');
var fs = require("fs");
var request = require('request');
var apiKey = 'acc_f14ac4cdd3af073',
var apiSecret = '6da8ea81d7b423b25dfe2b48fa7cadec';
var tempImageName = "out.png"
var imaggaContentUploadUrl = 'https://api.imagga.com/v1/content'

app.use('/', express.static(__dirname));

app.post('/analyze', function(req, res) {
  var imageAsBase64 = '';
  req.on('data', function(chunk) {
    imageAsBase64 += chunk;
  });
  req.on('end', function() {
    var image = imageAsBase64.replace(/^data:image\/png;base64,/, "");

    fs.writeFileSync(tempImageName, image, 'base64', function(err) {
      console.log(err); // writes out file without error, but it's not a valid image
    });

    var formData = {
          image: fs.createReadStream('./' + tempImageName)
      };

    request.post({url: imaggaContentUploadUrl, formData: formData}, function (error, response, body) {
      var bd = JSON.parse(body);
      if(bd.status == 'success') {
        console.log('first success');
        console.log('Response:', bd);

        var imageUrl = 'https://api.imagga.com/v1/tagging?content=' + bd.uploaded[0].id;

        request.get(imageUrl, function (error, response, body) {
          console.log('double success');
          console.log('Status:', response.statusCode);
          console.log('Response:', body);

          res.send(body);
        }).auth(apiKey, apiSecret, true);
      } else {
        console.log('Status:', response.statusCode);
        console.log('Response:', body);
        res.send(body);
      }
    }).auth(apiKey, apiSecret, true);
  });
});

app.listen(3000);
