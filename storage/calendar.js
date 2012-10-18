var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'aura');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to mongoose');
});

var schema = mongoose.Schema({
  start: 'string',
  end: 'string',
  title: 'string',
  color: 'string',
  id: 'string'
});

var CalendarEvent = db.model('CalendarEvent', schema);

// get the event by ID
// send back the result to the callback.get(doc) method
function getEvent(event_id, callback) {
  console.log('Get ' + event_id); 
  CalendarEvent.findOne({ id: event_id}, function (err, doc){
    console.log('Document : ', doc);
    console.log('Error : ', err);
    callback(err, doc);
  });
}

// Store a calendar event
function storeEvent(json, callback) {
  console.log('Store ' + json); 
  
  getEvent(json.id, function(err,doc) {
    console.log("Store err: ",err);
    console.log("Store doc: ",doc);
    if ( !doc ) {
      return onEventMissing();
    }
    doc.update(json, function(err) {
      if (err) {
        console.log('Storage error : ' + err);
      }
      callback(err);
    });
    
  });
 
  function onEventMissing () {
    var calendar_event = new CalendarEvent(json);
    calendar_event.save(function (err) {
      if (err) {
        console.log('Storage error : ' + err);
      }
      callback(err);
    });
  };
}

// Delete the calendar event
function deleteEvent(event_id, callback) {
  console.log('Delete ID ' + event_id);
  CalendarEvent.find({id : event_id}).remove(callback);
}

// exports

exports.getEvent = getEvent;
exports.storeEvent = storeEvent;
exports.deleteEvent = deleteEvent;
