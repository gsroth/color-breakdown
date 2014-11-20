// chrome.extension.onRequest.addListener(function(request, sender, callback) {
//   var tabId = request.tabId;
//   chrome.tabs.executeScript(tabId, { file: "content.js" }, function() {
//     chrome.tabs.sendRequest(tabId, {}, function(results) {
//       validateLinks(results, callback);
//     });
//   });
// });

function appendColor( container, color, type ) {
  
  var block = document.createElement( "div" );
  block.className = "block";
  c = color;
  if( type.substring( 0,3 ) === "hsl" ) {
    c[1] = "" + c[1] + "%";
    c[2] = "" + c[2] + "%";
  }

  var cString = type + "(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + c[3] + ")";
  console.log( cString );
  block.style.backgroundColor = cString;
  container.appendChild( block );

}



document.addEventListener( 'DOMContentLoaded', function () {

  chrome.tabs.executeScript( null, {file: "breaker.js"} );

} );

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

  console.log( "Array received" ); 
  console.log( request );
  if ( request.arr ) { 
    sendResponse( { status: "OK" } );
    var container = document.getElementById( "color-blocks" );
    for( color in request.arr ) {
      appendColor( container, request.arr[color], request.type );
    }
  } else {
    sendResponse( { status: "bad" } );
  }

});