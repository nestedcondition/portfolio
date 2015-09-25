'use strict';

var starterList = [
  new task( 'Pay Bills' ),
  new task( 'Go Shopping' ),
  new task( 'See the Doctor', 'completed' )
];

var oldList = todoUI.getLocalStorage();

var container = document.getElementById( 'container' );
container.onclick = function( event ) {

  if ( event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT' ) {
    //button handler
    if ( event.target.tagName === 'BUTTON' ) {
      todoUI.buttonHandler( event );
    }
    //input handler
    if ( event.target.tagName === 'INPUT' ) {
      todoUI.inputHandler( event );
    }
  }
};

var showQuote = function() {
  var quoteNum = Math.floor ( Math.random () * quoteList.length );

  var quoteHolder = document.getElementById( 'quote' );
  var randQuote = quoteList[ quoteNum ];
  quoteHolder.children[ 0 ].innerHTML = randQuote.quote;
  quoteHolder.children[ 2 ].innerHTML = randQuote.cite;
};


if ( oldList ) {
  var todoList = new taskList( oldList.tasks );
} else {
  var todoList = new taskList( starterList );
}

showQuote();
todoUI.buildLists( todoList );
