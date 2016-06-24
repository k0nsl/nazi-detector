function getActiveTabHostname(cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    var hostname = "";
    if (url) {
      // http://stackoverflow.com/questions/3689423/google-chrome-plugin-how-to-get-domain-from-url-tab-url
      hostname = url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
    }
    cb(null, hostname);
  });
}

function displayToggleState(toggleState) {
  getActiveTabHostname(function(err, hostname) {
    if (localStorage[hostname]) {
      toggleState.textContent = 'Enable';
    } else {
      toggleState.textContent = 'Disable';
    }
  });
}

function displayToggleCaseState(toggleCaseState) {
  chrome.runtime.getBackgroundPage(function(bg) {
    if (localStorage.caseSensitivity) {
      bg.caseSensitivity = parseInt(localStorage.caseSensitivity, 10);
    }
    if (bg.caseSensitivity) {
      toggleCaseState.textContent = 'Disable';
    } else {
      toggleCaseState.textContent = 'Enable';
    }
  });
}

function displaydoucheFactor(echoSpan) {
  chrome.runtime.getBackgroundPage(function(bg) {
    if (localStorage.doucheFactor) {
      bg.doucheFactor = parseInt(localStorage.doucheFactor, 10);
    }
    echoSpan.textContent = bg.doucheFactor.toString();
  });
}

function displayListLength(countSpan) {
  chrome.runtime.getBackgroundPage(function(bg) {
    var len = bg.theList.length;
    countSpan.textContent = len.toString().replace(/(\d)(?=(\d{3})+$)/, '$1,'); // add commas
  });
}

function displayVersion(versionSpan) {
  var manifest = chrome.app.getDetails();
  versionSpan.textContent = manifest.version;
}

function inc(cb) {
  chrome.runtime.getBackgroundPage(function(bg) {
    bg.doucheFactor++;
    localStorage.doucheFactor = bg.doucheFactor;
    cb(null, bg.doucheFactor);
  });
}

function dec(cb) {
  chrome.runtime.getBackgroundPage(function(bg) {
    if (bg.doucheFactor > 0) {
      bg.doucheFactor--;
      localStorage.doucheFactor = bg.doucheFactor;
      cb(null, bg.doucheFactor);
    }
  });
}

function restoreSavedList() {
  chrome.runtime.getBackgroundPage(function(bg) {
    if (localStorage.theList) {
      bg.console.warn('restoring');
      bg.theList = JSON.parse(localStorage.theList);
    }
  });
}

restoreSavedList();

document.addEventListener('DOMContentLoaded', function() {
  var toggle          = document.getElementById('toggle');
  var toggleState     = document.getElementById('toggleState');
  var toggleCase      = document.getElementById('toggleCase');
  var toggleCaseState = document.getElementById('toggleCaseState');
  var echoSpan        = document.getElementById('echo');
  var incSpan         = document.getElementById('inc');
  var decSpan         = document.getElementById('dec');
  var countSpan       = document.getElementById('count');
  var refresh         = document.getElementById('refresh');
  var loading         = document.getElementById('loading');
  var versionSpan     = document.getElementById('version');

  displayToggleState(toggleState);
  displayToggleCaseState(toggleCaseState);
  displaydoucheFactor(echoSpan);
  displayListLength(countSpan);
  displayVersion(versionSpan);

  toggle.addEventListener('click', function(ev) {
    chrome.runtime.getBackgroundPage(function(bg) {
      getActiveTabHostname(function(err, hostname) {
        if (hostname) {
          var val = localStorage[hostname];
          if (val) {
            localStorage.removeItem(hostname);
          } else {
            localStorage[hostname] = 1
          }
          displayToggleState(toggleState);
        }
      });
    });
  });

  toggleCase.addEventListener('click', function(ev) {
    chrome.runtime.getBackgroundPage(function(bg) {
      var val = localStorage.caseSensitivity;
      if (val) {
        localStorage.removeItem('caseSensitivity');
        bg.caseSensitivity = 0;
      } else {
        localStorage.caseSensitivity = 1;
        bg.caseSensitivity = 1;
      }
      displayToggleCaseState(toggleCaseState);
    });
  });

  incSpan.addEventListener('click', function(ev) {
    inc(function(err, doucheFactor) {
      echoSpan.textContent = doucheFactor.toString();
    });
  });

  decSpan.addEventListener('click', function(ev) {
    dec(function(err, doucheFactor) {
      echoSpan.textContent = doucheFactor.toString();
    });
  });

  refresh.addEventListener('click', function(ev) {
    loading.className = "";
    refresh.className = "";
    chrome.runtime.getBackgroundPage(function(bg) {
      bg.loadTheList(function(err){
        if (err) {
          refresh.className = "error";
        }
        displayListLength(countSpan);
        loading.className = "hidden";
      });
    });
  });
});
