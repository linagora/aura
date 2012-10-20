"use strict";
define(["../../../extensions/server/localChanges"], function(localChanges) {

  var syncResolver = function() {
    
    
    /**
     * localEvents: [ {id: ..., color:....}, ...] 
     * serverEvents: [ {id: ..., color: ...}, ... ]
     * compare: boolean fn (evt1, evt2) true if evts are equels
     * 
     * 
     */
    this.resolve = function(localEvents, serverEvents, compare) {
      var changed = {
        shouldStore: [],
        shouldSendStore: [],
        shouldDelete: [],
        shouldSendDelete: []
      };
      var onlyInServer = getUniques(serverEvents, localEvents);
      onlyInServer.forEach(function(item) {
        // I should have a deleted in local or a should apply it
        var localChange = localChanges.getChangeFor(item.id);
        if ( !localChange ) {
          changed.shouldStore.push(item);
        } else {
          changed.shouldSendDelete.push(item);
        }
      });
      
      var onlyInLocal = getUniques(localEvents, serverEvents);
      onlyInLocal.forEach(function(item) {
        var localChange = localChanges.getChangeFor(item.id);
        if ( !localChange ) {
          changed.shouldDelete.push(item);
        } else if ( localChange.action === localChanges.ACTION_STORED ) {
          changed.shouldSendStore.push(item);
        }
      });
      
      var shared = getCommon(localEvents, serverEvents);
      shared.forEach(function(itemSet) {
        if ( compare(itemSet[0], itemSet[1]) ) {
          return ;
        }
        var localChange = localChanges.getChangeFor(itemSet[0].id);
        if ( localChange ) {
          changed.shouldSendStore.push(itemSet[0]);
        } else {
          changed.shouldStore.push(itemSet[1]);
        }
      });
      
      return changed;
    };
    
    
    
    
    /* get ids beeing in a and not in b */
    var getUniques = function(a,b) {
      var b_ids = b.map(function(item) {return item.id});
      var back = a.filter(function(item) { return ( b_ids.indexOf(item.id) < 0 ) });
      return back;
    };
    
    /* get ids being in both a and b */
    var getCommon = function(a,b) {
      var a_items = {};
      var b_items = {};
      a.forEach(function(item) {a_items[item.id] = item;});
      b.forEach(function(item) {b_items[item.id] = item;});
      var back = [];
      for (var i in a_items ) {
        if ( i in b_items ) {
          back.push([a_items[i], b_items[i]]);
        }
      }
      return back;
    };
  };
  
  
  
  return syncResolver;
  
});