var express = require('express');
var store = require('./calendar');
var app = express();

app.get('/get', function(req, res){
  store.getEvent(123, function(doc){
    console.log('Back!');
    res.send(doc)
  });
});

app.get('/put', function(req, res) {
  store.storeEvent(
    {
      start: '20121018-1400',
      end: '20121018-1500',
      title: 'Event 1',
      color: 'blue',
      id: '123'
    });
    res.send('Stored');
});

app.get('/delete', function(req, res) {
  store.deleteEvent(123);
  res.send("Done");
});

app.listen(3001);
console.log('Listening on port 3001');