define(['sandbox',
       '../../../widgets/calendar/models/event',
       '../../../extensions/server/localChanges',
       '../../../extensions/server/syncResolver'
       ], 
       function(sandbox, Event, localChanges, syncResolver) {
  'use strict';


var serverSync = function(Events, eventsCollection) {

  var APIROOT="/calendar/event";
  var inBatch = false;
  
  
  var onUpdateCallback = function(type, evt) { 
    console.log("Got an event: ",evt.toJSON(), inBatch);
    if ( inBatch ) { return ;}
    localChanges.stored(evt.id);
    if ( !navigator.onLine ) {
      console.log("I'm offline, see ya later");
      return ;
    }
    applyEventRemotely(evt);
  };
  
  sandbox.on("Event::create","calendar",onUpdateCallback);

  sandbox.on("Event::update","calendar",onUpdateCallback);

  sandbox.on("Event::destroy","calendar",function(type, evt) { 
    console.log("Got an event: ",evt.toJSON(), inBatch);
    if ( inBatch ) return ;
    localChanges.deleted(evt.id);
    if ( !navigator.onLine ) {
      console.log("I'm offline, see ya later");
      return ;
    }
    removeEventRemotely(evt);
  });
  
  function applyEventRemotely(evt) {
    $.ajax({
      contentType: "application/json",
      data: JSON.stringify(evt),
      type: "PUT",
      url: APIROOT+"/"+evt.id,
      error: function() {
        console.log("Server sync failed");
      },
      success: function() {
        localChanges.remove(evt.id);
        console.log("Server sync succeded");
      }
    });
  };
  
  function applyEventLocally(event) {
    var evt = new Event();
    delete event._id;
    delete event.__v;
    evt.set(event);
    eventsCollection.add(evt);
    eventsCollection._byId[event.id] = evt;
    eventsCollection.trigger('event-added', evt);
    // should save evt after it belongs to the collection:
    // the collection brings the sync thing
    evt.save({}, {
      success: function() {console.log("evt persisted in localstorage");}
    });
  };
  
  function removeEventRemotely(evt) {
    $.ajax({
      contentType: "application/json",
      data: JSON.stringify(evt),
      type: "DELETE",
      url: APIROOT+"/"+evt.id,
      error: function() {
        console.log("Server sync failed");
      },
      success: function() {
        console.log("Server sync succeded");
        localChanges.remove(evt.id);
      }
    });
  };
  
  function removeEventLocally(event) {
    var evt = eventsCollection.get(event.id);
    console.log("get on event: ",evt);
//     evt.collection = eventsCollection;
    evt.destroy();
    eventsCollection.remove(evt);
  };
  
  function getLocalEvents (callback) {
    var evtCollection = new Events();
    evtCollection.fetch({
      success: function(col, events) { 
        console.log("fetch success",arguments); 
        callback(null, events);
      },
      error: function(err) {
        console.log("fetch error", arguments);
        callback(err);
      }
    });
  };

  
  function getServerEventIds (callback) {
    $.ajax({
      type: "GET",
      url: APIROOT+"s",
      error: function(err) {
        console.log("Server sync failed (getServerEventIds)");
        callback(err);
      },
      success: function(data) {
        console.log("Server sync succeded (getServerEventIds)", data);
        callback(null,data);
      }
    });
  };
  
  function getServerEvent(id, callback) {
    $.ajax({
      type: "GET",
      url: APIROOT+"/"+id,
      error: function(err) {
        console.log("Server sync failed");
        callback(err);
      },
      success: function(data) {
        console.log("Server sync succeded", data);
        callback(null,data);
      }
    });
  };
  
  function compareEvents (ev1, ev2) {
    var properties=["color","end","start","title"];
    var same = true;
    properties.forEach(function(prop) {
      if ( ev1[prop] != ev2[prop] ) {
        same = false;
      }
    });
    return same;
  };

  
  function getServerEvents(serverIds, callback) {
    var jobs = [];
    var events = [];
    var errors = 0;
    if ( serverIds.length ) {
      serverIds.forEach(function(id) {
        var f = function(then) {
          getServerEvent(id, then);
        };
        jobs.push(f);
      });
    }
    
    var nextStep = function() {
      if ( !jobs.length ) {
        if ( errors) {
          console.log("encoutered errors while fetching events");
          callback(errors);
          return ;
        }
        console.log("Got all remote events", events);
        callback(null, events);
        return ;
      }
      var job = jobs.pop();
      job(function(err, resp) {
        if( err ) {
          errors++;
        } else {
          events.push(resp);
        }
        nextStep();
      });
    };
    
    nextStep();
    
    
    
  };
  
  
  
  
  function syncFromServer () {
    if ( !navigator.onLine ) {
      console.log("I'm offline, see ya later");
      return ;
    }
    var responseCount = 2;
    var serverEvents = null;
    var clientEvents = null;
    getServerEventIds(function(err,resp) {
      if(  err ) {
        responseCount--;
        return onResponse();
      }
      getServerEvents(resp, function(err,resp) {
        responseCount--;
        if ( !err ) {
          serverEvents = resp;
        }
        onResponse();
      });
    });
    
    getLocalEvents(function(err,resp) {
      responseCount--;
      if ( !err ) {
        clientEvents = resp;
      }
      onResponse();
    });
    
    function onResponse () {
      if ( responseCount == 0 ) {
        if ( serverEvents === null ) {
          console.log("error from server communication");
          return ;
        }
        if ( clientEvents === null ) {
          console.log("error from local storage");
          return ;
        }
        console.log("OK, got client & server data",clientEvents, serverEvents);
        //// resolver
        var resolver = new syncResolver();
        var changes = resolver.resolve(clientEvents, serverEvents, compareEvents);
        console.log(changes);
        inBatch = true;
        changes.shouldStore.forEach(function(event) { applyEventLocally(event); });
        changes.shouldDelete.forEach(function(event) { removeEventLocally(event); });
        changes.shouldSendStore.forEach(function(event) { applyEventRemotely(event); });
        changes.shouldSendDelete.forEach(function(event) { removeEventRemotely(event); });
        inBatch = false;
      }
    };
  };
  
  
  syncFromServer();
};
  return serverSync;


});
