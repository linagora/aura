define(['sandbox', './views/app', './collections/events', 'fullcalendar', 'serverSync'], function(sandbox, AppView, Events, fc, serverSync) {
  'use strict';

  return function(options) {
    var events = new Events();

    new AppView({
      el: sandbox.dom.find(options.element),
      collection: events
    }).render();

    events.fetch();

    events.bind('event-added', function() { console.log("GOT event-added callback");});
    events.bind('event-modified', function() { console.log("GOT event-added callback");});
    
    try {
      new serverSync(Events, events);
    } catch(e) {
      console.log("error loading serverSync",e);
    }

    sandbox.emit('bootstrap', 'calendar');
    sandbox.emit('*', 'calendar', 'bubblegum');
    sandbox.on('bootstrap', 'calendar', function(from, data) {
      console.log('Calendar-bootstrap message from from: ' + from);
      console.log('Additional data:', data);
      sandbox.emit('*','controls');
    });
  };

});
