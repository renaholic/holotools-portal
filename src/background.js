const TOOLS_URL = 'https://hololive.jetri.co';

// rip the regex from https://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box
const YT_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;

chrome.browserAction.onClicked.addListener(async tab => {
  const isYouTubeVideo = tab.url.match(YT_REGEX);
  const toolTabs = await getExistingToolTabsOrNull();

  const query = tab.url.split('?')[1];
  const params = new URLSearchParams(query);
  const ytVideoId = params.has('v') && params.get('v');

  if (!isYouTubeVideo) {
    return;
  }

  if (isYouTubeVideo) {
    if (toolTabs.length > 0) {
      pushVideoToExistingTools(toolTabs[0], { type: 'youtube', url: tab.url });
    } else {
      chrome.tabs.update(tab.id, { url: `${TOOLS_URL}/#/watch?videoId=${ytVideoId}` });
    }
  }
});

function getExistingToolTabsOrNull() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ 'url': 'https://hololive.jetri.co/' }, tabs => tabs.length > 0 ? resolve(tabs) : resolve(null));
  });
}

function pushVideoToExistingTools(tab, payload) {
  chrome.tabs.sendMessage(tab.id, { action: 'append', payload });
  chrome.tabs.update(tab.id, { selected: true });
}
