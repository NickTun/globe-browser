const tabStorage = document.getElementById('tabs-container');
const tabSplitter = document.getElementById('tab-splitter');
const root = document.querySelector(':root');
import { activeTabs } from './variables/activeTabs.js';
import { openTab } from './variables/openTab.js';
import { addTab } from './functions/addTab.js';
import { selectTab } from './functions/selectTab.js';
import { createTab } from './functions/createTab.js';
window.windowId = null;

window.electronAPI.onAquireId((id, url) => {
    if(!window.windowId) window.windowId = id;
    selectTab(addTab(url));
});

window.electronAPI.onAquireTabTitle((title) => {
    openTab.childNodes[0].innerHTML = title;
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

tabStorage.addEventListener('dragenter', (e) => {
    const check = e.relatedTarget?.classList.contains('outside')
    if(check == undefined || check) {
        window.electronAPI.setDraggedWindowStatus(window.windowId);
        tabSplitter.classList.add('tab-splitter-open');
        // root.style.setProperty('--events', 'none');
    }
    
    e.preventDefault();
}, true);

tabStorage.addEventListener('dragover', function (e) {
    this.removeChild(tabSplitter);
    const offset = Math.floor((e.clientX-this.getBoundingClientRect().x)/120);
    this.insertBefore(tabSplitter, this.children[offset]);
    this.dataset.offset = offset;
});

tabStorage.addEventListener('dragleave', (e) => {
    const check = e.relatedTarget?.classList.contains('outside')
    if(check == undefined || check) {
        window.electronAPI.setDraggedWindowStatus(-1);
        tabSplitter.classList.remove('tab-splitter-open');
        // root.style.setProperty('--events', 'all');
    }
    
    e.preventDefault();
}, true);

tabStorage.addEventListener('drop', function (e) {
    const data = JSON.parse(e.dataTransfer.getData('json'));
    let selectedTab = null;
    if(data.windowId == windowId) {
        selectedTab = document.querySelector('.hidden');
    } else {
        // window.electronAPI.exchangeViews(data.tab_id, data.windowId, window.windowId);
        selectedTab = createTab(data.url, data.title, data.selection, data.focus);
        if(data.active) selectTab(selectedTab);
    }
    this.insertBefore(selectedTab, tabSplitter);
    tabSplitter.classList.remove('tab-splitter-open');
    e.stopPropagation();
}, true);