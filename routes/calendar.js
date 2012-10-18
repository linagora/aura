exports = module.exports = function(app) {
  app.get("/calendar/event/:id", function(req, res){
    res.send("Sending calendar event "+req.params.id);
  });
  
  app.put("/calendar/event/:id", function(req, res){
    res.send("Storing calendar event "+req.params.id);
  });
  
  app.del("/calendar/event/:id", function(req, res){
    res.send("deleting calendar event "+req.params.id);
  });
};