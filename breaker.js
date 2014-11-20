console.log( "ColorBreaker Loaded" );

function findColors( elem, list ) {
  var style = window.getComputedStyle( elem );
  var c = style[ "color" ];
  var b = style[ "background-color" ];
  if( c.substring(0,4) !== "rgba" || c.substring(c.length - 3) !== " 0)") {
    list[c] = true;
  }
  if( b.substring(0,4) !== "rgba" || b.substring(b.length - 3) !== " 0)") {
    list[b] = true;
  }
  if( elem.children.length === 0 ) return;
  for( var i = 0; i < elem.children.length; i++ ) {
    findColors( elem.children[i], list );
  }
}

function convertObjToArray( obj, saniFunc ) {
  var arr = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if( saniFunc !== null ) {
        key = saniFunc( key );
      }
      arr.push( key );
    }
  }
  return arr;
}

function convertColorToArray( color ) {
  var l = color.indexOf( "(" );
  var r = color.indexOf( ")" );
  color = color.substring( l + 1, r );
  var pieces = color.split(", ");
  for( var i = 0; i < pieces.length; i++ ) {
    pieces[i] = parseFloat( pieces[i] );
  }
  if( pieces.length === 3 ) {
    pieces[3] = 1;
  }
  return pieces;
}

function sqDistance( arr1, arr2 ) {
  if( arr1.length !== arr2.length ) return -1;
  var result = 0;
  for( var i = 0; i < arr1.length; i++ ) {
    var x = arr1[i] - arr2[i];
    result += x * x;
  }
  return Math.sqrt( result );
}

function makeColorObj( arr ) {
  var obj = { weight: 1 };
  obj.color = arr;
  obj.left = null;
  obj.right = null;
  return obj;
}

function treeCluster( arr, compFunc ) {
  var newarr = arr.map( makeColorObj );
  return treeClusterRec( newarr, compFunc );
}

function treeClusterRec( arr, compFunc ) {
  if( arr.length === 1 ) return arr[0];
  var mini = 0;
  var minj = 0;
  var mind = -1;
  for( var i = 0; i < arr.length; i++ ) {
    for( var j = 0; j < i; j++ ) {
      var dist = compFunc( arr[i].color, arr[j].color );
      if( mind === -1 || dist < mind ) {
        mini = i;
        minj = j;
        mind = dist;
      }
    }
  }

  var arri = arr[mini];
  var arrj = arr[minj];
  var w = arri.weight + arrj.weight;
  var c = [];
  for( var k = 0; k < arri.color.length; k++ ) {
    c[k] = ( arri.weight * arri.color[k] + arrj.weight * arrj.color[k] ) / w;
  }
  var obj;
  if( sqDistance( arri.color, [0, 0, 0, 0] ) > sqDistance( arri.color, [0, 0, 0, 0] ) ) {
    obj = { color: c, left: arri, right: arrj, weight: w };
  }
    obj = { color: c, left: arrj, right: arri, weight: w };

  var newarr = arr;
  newarr[mini] = newarr[newarr.length - 1];
  newarr[minj] = obj;
  newarr.pop();
  return treeClusterRec( newarr, compFunc );
}

function flattenTree( tree, arr ) {

  if( tree.weight === 1 ) {
    arr.push( tree.color );
    return;
  }
  flattenTree( tree.left, arr );
  flattenTree( tree.right, arr );

}

function getColors( list ) {
  var cArr = convertObjToArray( list, convertColorToArray);
  var tree = treeCluster( cArr, sqDistance );
  var flatArr = [];
  flattenTree( tree, flatArr );
  return flatArr;
}

(function() {

  var list = {};
  findColors( window.document.children[0], list );

  var result = getColors( list );

  chrome.runtime.sendMessage( {arr: result}, function( response ) {
    console.log( response.status );
  } );

})();
