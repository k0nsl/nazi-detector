function echo(s, factor) {
  var left = "";
  var right = "";
  for (var i = 0; i < factor; i++) {
    left += "卐";
    right += "卐";
  }
  return left + s + right;
}

chrome.runtime.sendMessage(null, {op: "clear-title"}, null, function(){});

chrome.runtime.sendMessage(null, {op:"load"}, null, function(state) {
  var theList = state.theList;
  var pattern = state.pattern;
  var caseSensitivity = state.caseSensitivity;
  var regexp = new RegExp(pattern, (caseSensitivity ? "g" : "gi"));
  var doucheFactor = state.doucheFactor;
  var storage = state.storage;
  var count = 0;

  var walk = function(node) {
    // I stole this function from here:
    // http://is.gd/mwZp7E

    var child, next;

    switch ( node.nodeType )
    {
      case 1:
      case 9:
      case 11:
        child = node.firstChild;
        while ( child )
        {
          next = child.nextSibling;
          walk(child);
          child = next;
        }
        break;

      case 3:
        handleText(node);
        break;
    }
  }

  var handleText = function(textNode) {
    var v = textNode.nodeValue;
    v = v.replace(regexp, function(j){ count++; return echo(j, doucheFactor) });
    v = v.replace(/\bTrump\b/g, echo("Trumpler", doucheFactor));
    v = v.replace(/\bMilo Yiannopoulos\b/g, echo("Human Trashfire", doucheFactor));
    textNode.nodeValue = v;
  }

  var hostname = location.hostname;
  if (! storage[hostname]) {
    walk(document.body);
  }

  /*
  if (count > 0) {
    chrome.runtime.sendMessage(null, { op: "set-title", text: count.toString() }, null, function(){});
  }
  */

});
