// chrome.extension.onRequest.addListener(function(request, sender, callback) {
//   var tabId = request.tabId;
//   chrome.tabs.executeScript(tabId, { file: "content.js" }, function() {
//     chrome.tabs.sendRequest(tabId, {}, function(results) {
//       validateLinks(results, callback);
//     });
//   });
// });

function appendColor( container, color ) {
  
  var block = document.createElement( "div" );
  block.className = "block";
  block.style.backgroundColor = "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + color[3] + ")";
  container.appendChild( block );

}



document.addEventListener( 'DOMContentLoaded', function () {

  chrome.tabs.executeScript( null, {file: "breaker.js"} );

} );

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

  console.log( "Array received" );  
  if ( request.arr ) { 
    sendResponse( { status: "OK" } );
    var container = document.getElementById( "color-blocks" );
    for( color in request.arr ) {
      appendColor( container, request.arr[color] );
    }
  } else {
    sendResponse( { status: "bad" } );
  }

});