'use strict';

function getBuildStatus() {
  const spans = document.querySelectorAll('[ng-bind-html="build.statusText()"]')
  if(spans && spans.length) {
    let docTitle = document.title
    if(docTitle.indexOf(" | ") > -1) {
      docTitle = docTitle.split(" | ")[1]
    }
    let status = spans[0].innerHTML.toUpperCase()
    let result = [status, status + " | " + docTitle]
    return result
  }
  return null
}

let interval = null

function refreshTabTitle(tabId, changeInfo, tab) {
  chrome.tabs.executeScript(tab.id, { code: '(' + getBuildStatus + ')();' }, (results) => {
    if (results) {
      chrome.tabs.executeScript(tab.id, { code : "document.title = '" + results[0][1] + "'"})
      let status = results[0][0]
      if((status == 'FAILED' || status == 'SUCCESS' || status == 'ABORTED') && interval) {
        clearInterval(interval)
      }
    }
  })  
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status == 'complete' && tab.url.indexOf('app.bitrise.io/build') > 0) {
    interval = setInterval(function() {
      refreshTabTitle(tabId, changeInfo, tab)
    }, 2000)
  }
})