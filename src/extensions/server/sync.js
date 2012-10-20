define(['sandbox',
       '../../../widgets/calendar/models/event'], 
       function(sandbox, Event) {
  'use strict';


var serverSync = function(Events, eventsCollection) {

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


  var APIROOT="/calendar/event";
  
  
  sandbox.on("Event::create","calendar",function(type, evt) { 
    console.log("Got an event: ",arguments);
    console.log("Got an event: ",evt.toJSON());
    if ( !navigator.onLine ) {
      console.log("I'm offline, see ya later");
      return ;
    }
    $.ajax({
      contentType: "application/json",
      data: JSON.stringify(evt),
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

  sandbox.on("Event::update","calendar",function(type, evt) { 
    console.log("Got an event: ",evt.toJSON()); 
    if ( !navigator.onLine ) {
      console.log("I'm offline, see ya later");
      return ;
    }
    $.ajax({
      contentType: "application/json",
      data: JSON.stringify(evt),
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

  sandbox.on("Event::destroy","calendar",function(type, evt) { 
    console.log("Got an event: ",arguments);
    console.log("Got an event: ",evt.toJSON());
    storeLSDeletedId(evt.id);
    if ( !navigator.onLine ) {
      console.log("I'm offline, see ya later");
      return ;
    }
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
        removeLSDeletedId(evt.id);
      }
    });
  });

  var deletedIdsStorageKey = "events-deleted";
  function storeLSDeletedId (id) {
    var keys = getLSDeletedIds();
    keys.push(id);
    keysStr = JSON.stringify(keys);
    localStorage.setItem(deletedIdsStorageKey, keysStr);
  };
  
  function getLSDeletedIds () {
    var keysStr = localStorage.getItem(deletedIdsStorageKey) || "[]";
    var keys;
    try {
      keys = JSON.parse(keysStr);
    } catch(e) {
      keys = [];
    }
    return keys;
  };
  
  function removeLSDeletedId(id) {
    var keys = getLSDeletedIds();
    var index = keys.indexOf(id);
    if ( index >= 0 ) {
      keys.splice(index,1);
      var keysStr = JSON.stringify(keys);
      localStorage.setItem(deletedIdsStorageKey, keysStr);
    }
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
  
  function eventsAreDifferent (ev1, ev2) {
    var properties=["color","end","start","title"];
    var different = false;
    properties.forEach(function(prop) {
      if ( ev1[prop] != ev2[prop] ) {
        different = true;
      }
    });
    return different;
  };
  
  function mergeLocalAndRemoteEvents(err, clientEvents, serverEvents) {
    if ( err ) {
      return console.log("sync failed: ",err);
    }
    var remoteIds = [];
    var localIds = [];
    var onlyRemote = [];
    var onlyLocal = [];
    var both = [];
    for (var i in clientEvents ) {
      localIds.push(i);
    }
    for (var i in serverEvents ) {
      remoteIds.push(i);
    }
    remoteIds.forEach(function(id) {
      if ( localIds.indexOf(id) >= 0 ) {
        both.push(id);
      } else {
        onlyRemote.push(id);
      }
    });
    
    localIds.forEach(function(id) {
      if ( remoteIds.indexOf(id) < 0 ) {
        onlyLocal.push(id);
      }
    });
    
    console.log("both:",both,"only local: ",onlyLocal,", onlyRemote: ",onlyRemote);
    
    var bothAndDifferent = [];
    both.forEach(function(id) {
      if ( eventsAreDifferent( clientEvents[id], serverEvents[id] ) ) {
        bothAndDifferent.push(id);
      }
    });
    
    console.log("both and different:",bothAndDifferent);
    if ( onlyRemote.length ) {
      var id = onlyRemote.pop();
      var evt = new Event();
      delete serverEvents[id]._id;
      delete serverEvents[id].__v;
      evt.set(serverEvents[id]);
      eventsCollection.add(evt);
      eventsCollection._byId[event.id] = event;
      eventsCollection.trigger('event-added', evt);
      // should save evt after it belongs to the collection:
      // the collection brings the sync thing
      evt.save({}, {
        success: function() {console.log("evt persisted in localstorage");}
      });
    }
    
  };
  
  function getServerEvents(serverIds, callback) {
    var jobs = [];
    var events = {};
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
          events[resp.id]=resp;
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
    var serverIds = null;
    var clientEvents = null;
    getServerEventIds(function(err,resp) {
      responseCount--;
      if ( !err ) {
        serverIds = resp;
      }
      onResponse();
    });
    
    getLocalEvents(function(err,resp) {
      responseCount--;
      if ( !err ) {
        clientEvents = {};
        resp.forEach(function(e) {clientEvents[e.id] = e;})
      }
      onResponse();
    });
    
    function onResponse () {
      if ( responseCount == 0 ) {
        if ( serverIds === null ) {
          console.log("error from server communication");
          return ;
        }
        if ( clientEvents === null ) {
          console.log("error from local storage");
          return ;
        }
        console.log("OK, got client & server data",clientEvents, serverIds);
        getServerEvents(serverIds, function(err,serverEvents) {
          mergeLocalAndRemoteEvents(err, clientEvents, serverEvents);
        });
      }
    };
  };
  
  
  syncFromServer();
};
  return serverSync;


});
