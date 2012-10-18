var express = require('express');
var app = express();
var calendarRoutes = require("./routes/calendar");

// app.use(express.directory('src'));

calendarRoutes(app);

app.use(express.static('src'))

app.listen(3000);
console.log('Listening on port 3000');