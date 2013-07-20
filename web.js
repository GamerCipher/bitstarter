var express = require('express');
var fs=require('fs');
var app = express.createServer(express.logger());
var serveFile= function(response,fname) {
  fs.readFile(fname, function(err, data) {
    if (err) throw err;
    response.send(data.toString());
  });
};
app.use(express.static(__dirname));
app.get('/', function(request, response) {
  serveFile(response,'index.html');  
});

app.get('/about', function(request, response) {
  serveFile(response,'about.html');  
});

app.get('/contact', function(request, response) {
  serveFile(response,'contact.html');  
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
