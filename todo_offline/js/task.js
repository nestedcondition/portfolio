// task object
// label = thing to do
// state = 'completed' or 'incomplete' or 'new'
// id is uuid from below

'use strict';

function task( label, state ){
  this.label = label;
  this.state = state || 'incomplete';
  this.id = this.newID();
}

task.prototype.newID = function() {
  return uuid.v4();
};
