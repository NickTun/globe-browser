import { pushTab, insertTab, activeTabs } from './variables/activeTabs.js';
import { openTab } from './variables/openTab.js';
import { addTab } from './functions/addTab.js';
import { selectTab } from './functions/selectTab.js';
import { createTab } from './functions/createTab.js';
import { tabSplitter, handleTabSplitter } from './functions/handleTabSplitter.js';

const tabStorage = document.getElementById('tabs-container');
const urlWrapper = document.getElementById('url-wrapper');
const url = document.getElementById('url');
const newTab = document.getElementById('new-tab');

window.windowId = null;

window.electronAPI.onAquireId((id, data) => {
    if(!window.windowId) window.windowId = id;
    const tab = addTab();
    if(data) {
        if(data.active) {
            pushTab(tab);
            tab.dataset.active = true;
            window.electronAPI.exchangeViews(data.tab_id, data.windowId, window.windowId);
        }
        tab.dataset.url = data.url;
        tab.dataset.selection = data.selection;
        tab.dataset.focus = data.focus;
        tab.firstChild.innerHTML = data.title;
    }
    selectTab(tab);
});

window.electronAPI.onAquireTabTitle((title, tab_id) => {
    activeTabs[tab_id].children[0].innerHTML = title;
});

window.electronAPI.onUrlChange((url_str, tab_id) => {
    activeTabs[tab_id].dataset.url = url_str;
    url.value = url_str;
});

newTab.addEventListener('click', () => {
    const tab = addTab();
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

urlWrapper.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    if(formData.get('url') != "") {
        if(!openTab.hasAttribute('data-active')) {
            pushTab(openTab);
            openTab.dataset.active = true;
            window.electronAPI.newTabView(formData.get('url'), window.windowId);
            window.electronAPI.selectTabView(activeTabs.indexOf(openTab), window.windowId);
        } else {
            window.electronAPI.loadUrl(formData.get('url'), activeTabs.indexOf(openTab), window.windowId);
        }
    }
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

tabStorage.addEventListener('dragenter', function (e) {
    if(!tabStorage.contains(e.relatedTarget)) {
        window.electronAPI.setDraggedWindowStatus(window.windowId);
    }
    
    e.preventDefault();
}, true);

tabStorage.addEventListener('dragover', function (e) {
    handleTabSplitter(e, this);
});

tabStorage.addEventListener('dragleave', (e) => {
    if(!tabStorage.contains(e.relatedTarget)) {
        window.electronAPI.setDraggedWindowStatus(-1);
        tabStorage.removeChild(tabSplitter);
        tabStorage.dataset.offset = -1;
    }
    
    e.preventDefault();
}, true);

tabStorage.addEventListener('drop', function (e) {
    const data = JSON.parse(e.dataTransfer.getData('json'));
    const selectedTab = createTab(data.url, data.title, data.selection, data.focus, data.active); 

    this.insertBefore(selectedTab, tabSplitter);

    tabStorage.removeChild(tabSplitter);
    tabStorage.dataset.offset = -1;

    if(data.active) {
        if(data.windowId == windowId) {
            insertTab(data.tab_id, selectedTab)
        } else {
            pushTab(selectedTab);
            window.electronAPI.exchangeViews(data.tab_id, data.windowId, window.windowId);
        }
        selectTab(selectedTab);
    }
    e.stopPropagation();
}, true);