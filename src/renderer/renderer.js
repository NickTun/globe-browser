const tabStorage = document.getElementById('tabs-container');
const root = document.querySelector(':root');
import { activeTabs } from './variables/activeTabs.js';
import { openTab } from './variables/openTab.js';
import { addTab } from './functions/addTab.js';
import { selectTab } from './functions/selectTab.js';
window.windowId = null;

window.electronAPI.onAquireId((id) => {
    if(!window.windowId) window.windowId = id;
    selectTab(addTab());
});

const newTab = document.getElementById('new-tab');
newTab.addEventListener('click', () => {
    selectTab(addTab());
});

newTab.addEventListener('mousedown', (e) => {
    if(openTab) {
        if(url === document.activeElement) {
            openTab.dataset.focus = true;
        } else {
            openTab.removeAttribute('data-focus');
        }
    }
});

const urlWrapper = document.getElementById('url-wrapper');
const url = document.getElementById('url');

urlWrapper.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    window.electronAPI.loadUrl(formData.get('url'), activeTabs.indexOf(openTab), window.windowId);
});

url.addEventListener('input', (e) => {
    openTab.dataset.url = e.target.value;
});

url.addEventListener('selectionchange', (e) => {
    if(e.isTrusted) openTab.dataset.selection = [e.target.selectionStart, e.target.selectionEnd];
});

window.addEventListener('focus', (e) => {
    url.blur();
});

window.addEventListener('dragover', (e) => {
    e.preventDefault();
});

tabStorage.addEventListener('dragover', (e) => {
    root.style.setProperty('--events', 'none');
    e.preventDefault();
});