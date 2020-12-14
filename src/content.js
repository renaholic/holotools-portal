/* 
  this js should only be running in "https://hololive.jetri.co/*" (according to manifest.json)
*/
const DELAY_MS = 300;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // msg = { action: 'append', payload:{ type: 'youtube', url: string } }
  const { action, payload } = msg;
  if (!action || !payload) {
    return;
  }

  if (action === 'append') {
    addVideo(payload);
  }
});


async function addVideo({ type, url }) {
  const LiveAddEle = document.querySelector('div.live-list-controls.live-add');
  LiveAddEle.click();

  // wait for animation to finish
  await delay(DELAY_MS);

  const inputEle = document.querySelector('div>div>input.md-input.input-search');
  inputEle.value = url;
  // the site is listening for input event
  inputEle.dispatchEvent(new Event('input'));

  // wait for event to propagate
  await delay(DELAY_MS);

  const addEle = document.querySelector('body > div.md-dialog.md-dialog-fullscreen.md-theme-holodark > div > div.md-scrollbar.color-100.md-dialog-content.md-theme-holodark > div:nth-child(3) > div.md-dialog-actions > button');
  addEle.click();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}
