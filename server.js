var express = require('express');
var app = express();
<<<<<<< HEAD

app.get('/cache.manifest', function(req, res){
  res.set('Content-Type', 'text/html');
  res.sendFile('/cache.manifest');
});
=======
var calendarRoutes = require("./routes/calendar");
>>>>>>> bc659afa4b9bd573e172daf8750bf923a482c407

// app.use(express.directory('src'));

calendarRoutes(app);

app.use(express.static('src'))

app.listen(3000);
console.log('Listening on port 3000');