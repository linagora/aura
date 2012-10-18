var express = require('express');
var app = express();


// app.use(express.directory('src'));
app.use(express.static('src'))

app.listen(3000);
console.log('Listening on port 3000');