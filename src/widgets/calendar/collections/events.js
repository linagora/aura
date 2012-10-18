define(['sandbox', '../models/event'], function(sandbox, Event) {
  'use strict';

  var storageCallbacks = {
    onCreate: function(name, model) {
      sandbox.emit("Event::create",model);
    },
    onUpdate: function(name, model) {
      sandbox.emit("Event::update",model);
    },
    onDestroy: function(name, model) {
      sandbox.emit("Event::destroy",model);
    }
  };

  var Events = sandbox.mvc.Collection({
    model: Event,

    // url: 'events',

    // Save all of the calendar items under the `'events'` namespace.
    localStorage: new sandbox.data.Store('events-backbone-require', storageCallbacks)
  });

  return Events;

});
