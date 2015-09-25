// taskList.task = array of tasks
// has uuid

'use strict';

function taskList( tasks ){
  this.tasks = tasks || [];
  this.id = this.newID();
};

taskList.prototype.newID = function() {
  return uuid.v4();
};



taskList.prototype.addTask = function( task ) {
  this.tasks.unshift( task );
};


taskList.prototype.deleteTask = function( id )  {
  this.tasks = this.tasks.filter( function( cv ) {
    return cv.id !== id;
  });
};


taskList.prototype.getTask = function( id ) {
  for( var i = 0; i < this.tasks.length; i++ ) {
    if( this.tasks[ i ].id === id ) {
      return {
        label: this.tasks[ i ].label,
        state: this.tasks[ i ].state
      };
    }
    
  }

  return false;
};


taskList.prototype.modifyTask = function ( id, change ) {
  var oldTask = this.getTask( id );

  if ( !change || !oldTask ){
    console.log( "I'm sorry Dave. I can't do that.");
    return false;
  } else if ( !change.label ) {
    this.addTask( new task( oldTask.label, change.state ) );
    console.log( 'changed state only' );

  } else if ( !change.state ) {
      this.addTask( new task( change.label, oldTask.state ) );
      console.log( 'changed label only' );

  } else {
    this.addTask( new task( change.label, change.state ) );
    console.log( 'changed state & label' );
  }

  this.deleteTask( id );
  return true;
};
