console.log( "ColorBreakdown Loaded" );

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

function getColorsRGB( list ) {

  var cArr = convertObjToArray( list, convertColorToArray);
  var tree = treeCluster( cArr, sqDistance );
  var flatArr = [];
  flattenTree( tree, flatArr );
  return flatArr;

}

function convertRGBAtoHSLA( color ) {
  
  var mini = 0;
  var maxi = 0;

  for( var i = 1; i < 3; i++ ) {
    if( color[i] > color[maxi] ) maxi = i;
    if( color[i] < color[mini] ) mini = i;

  }

  var chroma = color[maxi] - color[mini];
  var hue;

  if( chroma === 0 ){
    hue = 0;

  } else if( maxi === 0 ) {
    hue = ( color[1] - color[2] ) / chroma;
    if( hue < 0 ) hue = hue + 6;

  } else if( maxi === 1 ) {
    hue = ( ( color[2] - color[0] ) / chroma ) + 2;

  } else if( maxi === 2 ) {
    hue = ( ( color[0] - color[1] ) / chroma ) + 4;

  }

  hue = hue * 60;

  var rLuma = 0.2126;
  var gLuma = 0.7152;
  var bLuma = 0.0722;

  var luma = rLuma * color[0] + gLuma * color[1] + bLuma * color[2];

  var hsla = [0, 0, 0, 0];
  hsla[0] = Math.round( hue );
  hsla[1] = Math.round( chroma / 2.55 ); // *100/255 to normalize to 0-100% 
  hsla[2] = Math.round( luma / 2.55 );
  hsla[3] = color[3];

  return hsla;

}

function convertToHSL( list ) {
  var result = [];
  for( color in list ) {
    result.push( convertRGBAtoHSLA( list[color] ) );
  }
  return result;
}

function compareHSL( arr1, arr2 ) {

  if( arr1[1] === 0 && arr2[1] !== 0 ) return -1;
  if( arr1[1] !== 0 && arr2[1] === 0 ) return 1;

  if( arr1[1] < arr2[1] ) return 1;
  if( arr1[1] > arr2[1] ) return -1;

  if( arr1[2] < arr2[2] ) return -1;
  if( arr1[2] > arr2[2] ) return 1;

  if( arr1[0] < arr2[0] ) return -1;
  if( arr1[0] > arr2[0] ) return 1;


  if( arr1[3] < arr2[3] ) return -1;
  if( arr1[3] > arr2[3] ) return 1;
  return 0;

}

function getColorsHSL( list ) {

  var cArr = convertObjToArray( list, convertColorToArray);
  var hslArr = convertToHSL( cArr );
  // hslArr.sort( compareHSL );

//   box-shadow: 0px 0px 1px 6px red inset;
// -webkit-transition: box-shadow 1s ease;
  
  return hslArr;

}

(function() {

  var list = {};
  findColors( window.document.children[0], list );

  var result = getColorsHSL( list );

  chrome.runtime.sendMessage( {arr: result, type: "hsla"}, function( response ) {
    console.log( response.status );
  } );

})();
