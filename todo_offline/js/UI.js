'use strict';

var todoUI = {

  getLocalStorage: function() {
    var storage = localStorage.getItem( 'todoList' );

    if ( storage ) {
      storage = JSON.parse( storage );
      return storage;
    }

    return false;
  },

  setLocalStorage: function() {
    localStorage.setItem( 'todoList', JSON.stringify( todoList ) );
  },

  addButtonHandler: function( event ) {
    todoList.addTask( new task( event.target.parentElement.children[1].value ) );
    this.buildLists( todoList );
    event.target.parentElement.children[1].value = '';
  },

  editButtonHandler: function( event ) {
    var id = event.target.parentElement.id;
    var classList = event.target.parentElement.classList;
    var value = event.target.parentElement.children[2].value;

    if ( classList.contains( 'editMode' ) ) {
      classList.remove( 'editMode' );
      if ( value ) {
        todoList.modifyTask( id, { 'label': value } );
        console.log( id, event.target.parentElement.children[2].value );
      }

      this.buildLists( todoList );
    } else {
      classList.add( 'editMode' );
    }
  },

  deleteButtonHandler: function( event ) {
    todoList.deleteTask( event.target.parentElement.id );
    this.buildLists( todoList );
  },

  checkboxInputHandler: function( event ) {
    var id = event.target.parentElement.id

    if ( event.target.checked ){
      todoList.modifyTask( id, {state: 'completed' } );
    } else {
      todoList.modifyTask( id, {state: 'incomplete' } );
    }

    this.buildLists( todoList );
  },

  buttonHandler: function( event ) {
    var id = event.target.parentElement.id;
    var classList = event.target.classList;
    console.log( 'a buttonHandler will handle it');

    if ( classList.contains( 'add' ) ) {
      //add button
      this.addButtonHandler( event );
      console.log( 'add button' );

    } else if ( classList.contains( 'edit' ) ) {
      //edit button
      this.editButtonHandler( event );
      console.log( 'edit button' );

    } else if ( classList.contains( 'delete' ) ) {
      //delete button
      this.deleteButtonHandler( event );
      console.log( 'delete button' );
    }
  },


  inputHandler: function( event ) {
    var type = event.target.type;
    console.log( 'inputHandler will handle it');

    if ( type === 'checkbox' ) {
      //checkbox
      this.checkboxInputHandler( event );
      console.log( 'this came from a checkbox input' );
    }
  },

  buildLI: function( newTask ) {
    // make <li>
    var LI = document.createElement( 'li' );
    LI.id = newTask.id;
    LI.className = newTask.state;

    // add checkbox-input
    var checkBox = document.createElement( 'input' );
    checkBox.type = 'checkbox';
    var checkIt = {
      'incomplete' : false,
       'completed' : true
    };
    checkBox.checked = checkIt[ newTask.state ];
    LI.appendChild( checkBox );

    // add label
    var label = document.createElement( 'label' );
    // use the browser to prevent XXS
    // shebang.brandonmintern.com/foolproof-html-escaping-in-javascript
    var labelText = document.createTextNode( newTask.label );
    label.appendChild( labelText );
    LI.appendChild( label );

    // add input
    var textInput = document.createElement( 'input' );
    textInput.type = 'text';
    // may want to remove or change to innerHTML
    textInput.textContent = newTask.label;
    LI.appendChild( textInput );

    // add edit button
    var editButton = document.createElement( 'button' );
    editButton.className = 'edit';

    if (typeof editButton.innerText === "undefined")  {
      editButton.textContent = "Edit";
    } else {
      editButton.innerText = "Edit";
    }
    LI.appendChild( editButton );

    // add delete button
    var deleteButton = document.createElement( 'button' );
    deleteButton.className = 'delete';

    if (typeof deleteButton.innerText === "undefined")  {
      deleteButton.textContent = "Delete";
    } else {
      deleteButton.innerText = "Delete";
    }
    LI.appendChild( deleteButton );

    return LI;
  },


  buildLists: function( taskList ) {
    var oldIncomplete = document.getElementById( 'incomplete-tasks' );
    var oldCompleted = document.getElementById( 'completed-tasks' );

    // <ul id="incomplete-tasks">
    var incompleteTasks = document.createElement( 'ul' );
    incompleteTasks.id = 'incomplete-tasks';

    // <ul id="completed-tasks">
    var completedTask = document.createElement( 'ul' );
    completedTask.id = 'completed-tasks';

    // build tasks and sort into holders
    taskList.tasks.forEach( function( cv ) {
      var newTask = todoUI.buildLI( cv );
      if ( newTask.className === 'completed' ) {
        completedTask.appendChild( newTask );
      }
      if ( newTask.className === 'incomplete' ) {
        incompleteTasks.appendChild( newTask );
      }
    });

    container.replaceChild( incompleteTasks, oldIncomplete  );
    container.replaceChild( completedTask, oldCompleted  );

    this.setLocalStorage();
  },

};
