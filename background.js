// Initial list in case load doesn't work.
var theList = [
  "weev",
  "rabite",
  "Andrew Aurenheimer",
  "Ricky Vaughn"
];

var doucheFactor = 1;

var caseSensitivity = 1;

var sourceUrl = 'https://cdn.rawgit.com/selfagency/nazi-detector/master/theList.json';

var loaded = false;

var pattern = buildPattern(theList);

function buildPattern(list) {
  return '\\b(' + list.join('|') + ')\\b';
}

// load
function load(url, cb) {
  console.warn('load', url);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var data = JSON.parse(xhr.responseText);
      cb(null, data);
    }
  };
  xhr.onerror = function() {
    cb(new Error("Could not load '"+url+"'"));
  };
  xhr.send();
}

// loadTheList
function loadTheList(cb){
  console.warn('loadTheList');
  load(sourceUrl, function(err, data){
    if (err) {
      console.warn("loadTheList", err);
      if (cb && typeof cb === "function") cb(err);
    } else {
      loaded = true;
      theList = data;
      pattern = buildPattern(theList);
      localStorage.theList = JSON.stringify(data);
      if (cb && typeof cb === "function") cb(null, theList);
    }
  });
};

// onStartup
chrome.runtime.onStartup.addListener(loadTheList);

// onInstalled
chrome.runtime.onInstalled.addListener(loadTheList);

// onMessage
chrome.runtime.onMessage.addListener(function(command, sender, sendResponse){
  console.warn('background', command, theList.length);
  switch (command.op) {
    case "load":
      if (!loaded) {
        console.warn('loading data');
        if (localStorage.theList) {
          theList = JSON.parse(localStorage.theList);
          pattern = buildPattern(theList);
        }
        loadTheList(); // It should be ready for the next page load.
      }
      if (localStorage.doucheFactor) {
        doucheFactor = parseInt(localStorage.doucheFactor, 10);
      }
      if (localStorage.caseSensitivity) {
        caseSensitivity = parseInt(localStorage.caseSensitivity, 10);
      }
      sendResponse({ theList: theList, pattern: pattern, caseSensitivity: caseSensitivity, doucheFactor: doucheFactor, storage: localStorage });
      break;
    case "clear-title":
      chrome.browserAction.setBadgeText({ text: '' });
      break;
    case "set-title":
      chrome.browserAction.setBadgeText({ text: command.text });
      break;
  }
});
