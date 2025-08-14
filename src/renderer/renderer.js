const tabStorage = document.getElementById('tabs-container');
const tabSplitter = document.getElementById('tab-splitter');
import { pushTab, activeTabs } from './variables/activeTabs.js';
import { openTab } from './variables/openTab.js';
import { addTab } from './functions/addTab.js';
import { selectTab } from './functions/selectTab.js';
import { createTab } from './functions/createTab.js';
window.windowId = null;

window.electronAPI.onAquireId((id, url) => {
    if(!window.windowId) window.windowId = id;
    const tab = addTab(url);
    pushTab(tab);
    tab.dataset.active = true;
    window.electronAPI.newTabView(tab.dataset.url, window.windowId);
    selectTab(tab);
});

window.electronAPI.onAquireTabTitle((title) => {
    console.log(openTab)
    openTab.childNodes[0].innerHTML = title;
});

const newTab = document.getElementById('new-tab');
newTab.addEventListener('click', () => {
    const tab = addTab();
    pushTab(tab);
    tab.dataset.active = true;
    window.electronAPI.newTabView(tab.dataset.url, window.windowId);
    selectTab(tab);
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
        console.log("enter")
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
        console.log("leave")
    }
    
    e.preventDefault();
}, true);

tabStorage.addEventListener('drop', function (e) {
    const data = JSON.parse(e.dataTransfer.getData('json'));
    const selectedTab = createTab(data.url, data.title, data.selection, data.focus, data.active);    
    this.insertBefore(selectedTab, tabSplitter);
    if(data.active) {
        pushTab(selectedTab);
        if(data.windowId != windowId) {
            window.electronAPI.exchangeViews(data.tab_id, data.windowId, window.windowId);
        }
        selectTab(selectedTab);
    }
    tabSplitter.classList.remove('tab-splitter-open');

    console.log(activeTabs)
    e.stopPropagation();
}, true);