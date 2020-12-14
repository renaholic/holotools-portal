const TOOLS_URL = 'https://hololive.jetri.co';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Add to HoloTools',
    id: 'add-to-holotool',
    contexts: ['link'],
    targetUrlPatterns: ['*://www.youtube.com/watch*'],
  });
});

chrome.contextMenus.onClicked.addListener(async ({ menuItemId, linkUrl }) => {
  if (menuItemId === "add-to-holotool") {
    const toolTabs = await getExistingToolTabsOrNull();
    if (toolTabs) {
      pushVideoToExistingTools(toolTabs[0], { type: 'youtube', url: linkUrl });
    } else {
      const ytVideoId = extractYouTubeVideoId(linkUrl);
      chrome.tabs.create({ url: `${TOOLS_URL}/#/watch?videoId=${ytVideoId}` });
    }
  }
});

// rip the regex from https://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box
const YT_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;

chrome.browserAction.onClicked.addListener(async tab => {
  const isYouTubeVideo = YT_REGEX.test(tab.url);

  const toolTabs = await getExistingToolTabsOrNull();

  const ytVideoId = extractYouTubeVideoId(tab.url);
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

function extractYouTubeVideoId(url) {
  const query = url.split('?')[1];
  const params = new URLSearchParams(query);
  return params.has('v') && params.get('v');
}
