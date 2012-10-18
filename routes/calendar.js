var store = require("../storage/calendar");
var express = require('express');

exports = module.exports = function(app) {
  var app1 = express();
  app.get("/calendar/event/:id", function(req, res){
    store.getEvent(request.params.id, function(err, doc){
      console.log('Back!');
      if ( err ) {
        return res.status(500).send(err);
      }
      res.send(doc);
    });
//     res.send("Sending calendar event "+req.params.id);
  });
  app1.use(express.bodyParser());
  app1.put("/calendar/event/:id", function(req, res){
    store.storeEvent(req.body, function(err) {
      if ( err ) {
        return res.status(500).send(err);
      }
      res.send(req.body);
      
    });
  });
  
  app1.del("/calendar/event/:id", function(req, res){
    store.deleteEvent(req.params.id,function(err) {
      if ( err ) {
        return res.status(500).send(err);
      }
      res.send(req.body);
    });
  });
  
  app.use(app1);
};