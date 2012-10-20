var express = require('express');
var app = express();

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.get('/cache.manifest', function(req, res){
  res.set('Content-Type', 'text/html');
  res.sendFile('/cache.manifest');
});
var calendarRoutes = require("./routes/calendar");

// app.use(express.directory('src'));

calendarRoutes(app);

app.use(express.static('src'))

app.listen(3000);
console.log('Listening on port 3000');
