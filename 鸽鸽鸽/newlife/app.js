var express = require('express');
var activityrouter = require('./routers/activity');
var config = require('./config');
var userrouter = require('./routers/user');

var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.use('/activity',activityrouter);
app.use('/userInfo', userrouter);
var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

//listen for error.
