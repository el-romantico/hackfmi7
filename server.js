var express = require('express');
var app = express();
var http = require('http');

app.use('/', express.static(__dirname));

app.get('/analyze', function(req, res) {
  var options = {
    host: 'api.imagga.com',
    path:
        '/v1/tagging?url=http://imagga.com/static/images/tagging/wind-farm-538576_640.jpg',
    headers: {
      'Authorization':
          'Basic YWNjX2YxNGFjNGNkZDNhZjA3Mzo2ZGE4ZWE4MWQ3YjQyM2IyNWRmZTJiNDhmYTdjYWRlYw=='
    }
  };
  var req = http.request(options, function(response) {
    var str = '';
    response.on('data', function(chunk) {
      console.log("here");
      str += chunk;
    });
    response.on('end', function() { res.send(str); });
  });
  req.end();
});

app.listen(3000);
