define(['sandbox'], function(sandbox) {
  'use strict';

  console.log("~~~~~~~~~~~~~~~~~~é loading");

  var APIROOT="/calendar/event";
  
  
  sandbox.on("Event::create","calendar",function(type, evt) { 
    console.log("Got an event: ",arguments);
    console.log("Got an event: ",evt.toJSON()); 
    $.ajax({
      contentType: "application/json",
      data: evt.toJSON(),
      type: "PUT",
      url: APIROOT+"/"+evt.id,
      error: function() {
        console.log("Server sync failed");
      },
      success: function() {
        console.log("Server sync succeded");
      }
    });
  });

  /*
  sandbox.on("Event::update","calendar",function(type, evt) { 
    console.log("Got an event: ",arguments);
    console.log("Got an event: ",evt.toJSON()); 
  });
  
  sandbox.on("Event::delete","calendar",function(type, evt) { 
    console.log("Got an event: ",arguments);
    console.log("Got an event: ",evt.toJSON()); 
  });
  */
  
  return {};


});
