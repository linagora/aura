"use strict";
define([], function() {
  
  var ACTION_DELETED = "deleted";
  var ACTION_STORED = "stored";
  
  var changedStorageKey = "events-changes";
  
  function getDeletedChangeObject(id) {
    return {id:id, action:ACTION_DELETED};
  };
  
  function getStoredChangeObject(id) {
    return {id:id, action:ACTION_STORED};
  };
  
  function getLocalStore () {
    var keysStr = localStorage.getItem(changedStorageKey) || "[]";
    var keys;
    try {
      keys = JSON.parse(keysStr);
    } catch(e) {
      keys = [];
    }
    return keys;
  };
  
  function setLocalStore(store) {
    localStorage.setItem(changedStorageKey, JSON.stringify(store)); 
  };
  
  function getChangeFor(id) {
    var store = getLocalStore();
    for (var i in store ) {
      if ( store[i].id == id ) {
        return store[i];
      }
    }
    return null;
  };
  
  function removeChangeFor(id) {
    var store = getLocalStore();
    for (var i in store ) {
      if ( store[i].id == id ) {
        store.splice(i,1);
        setLocalStore(store);
        return ;
      }
    }
    return ;
  };
  
  function setChange(change) {
    removeChangeFor(change.id);
    var store = getLocalStore();
    store.push(change);
    setLocalStore(store);
  };
  
  function storeIdStored(id) {
    setChange(getStoredChangeObject(id));
  };
  
  function storeIdDeleted(id) {
    setChange(getDeletedChangeObject(id));
  };

  function gotId(id) {
    var store = getLocalStore();
    for (var i in store) {
      if ( store[i].id == id ) {
        return true;
      }
    }
    return false;
  };
  
  return {
    stored: storeIdStored,
    deleted: storeIdDeleted,
    exists: gotId,
    remove: removeChangeFor,
    getChangeFor: getChangeFor,
    ACTION_DELETED: ACTION_DELETED,
    ACTION_STORED: ACTION_STORED
  };
});