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
    console.log('Document : ' + doc);
    console.log('Error : ' + err);
    callback.call(null, doc);
  });
}

// Store a calendar event
function storeEvent(json) {
  console.log('Store ' + json); 
  
  var calendar_event = new CalendarEvent(json);
  calendar_event.save(function (err) {
    if (err) {
      console.log('Storage error : ' + err);
    }
  });
}

// Delete the calendar event
function deleteEvent(event_id) {
  console.log('Delete ID ' + event_id);
  CalendarEvent.find({id : event_id}).remove();
}

// exports

exports.getEvent = getEvent;
exports.storeEvent = storeEvent;
exports.deleteEvent = deleteEvent;
