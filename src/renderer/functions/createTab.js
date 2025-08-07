const tabStorage = document.getElementById('tabs-container');
const root = document.querySelector(':root');
import { openTab } from '../variables/openTab.js';
import { selectTab } from './selectTab.js';
import { closeTab } from './closeTab.js';
import { unloadTab } from './unloadTab.js';

export function createTab(title="New Tab", url_str="", selection=[0, 0], focus=false, active=false) {
    const tabWrapper = document.createElement('div');
    const tab = document.createElement('div');
    const close = document.createElement('button');
    const unload = document.createElement('button');
    close.innerHTML = "x";
    unload.innerHTML = "u";
    tab.classList.add('tab');
    tabWrapper.appendChild(tab);
    tabWrapper.classList.add('tab-wrapper');
    tab.appendChild(close);
    tab.appendChild(unload);
    tab.dataset.url = url_str;
    tab.dataset.selection = selection;
    tab.dataset.title = title;
    if(focus) tab.dataset.focus = true;
    if(active) tab.dataset.active = true;
    tabWrapper.draggable = true;

    tab.addEventListener('click', (e) => {
        selectTab(e.target.parentElement)
    });

    close.addEventListener('click', (e) => {
        closeTab(e.target.parentElement.parentElement);
        e.stopPropagation();
    }, { capture: true });

    unload.addEventListener('click', (e) => {
        unloadTab(e.target.parentElement.parentElement);
        e.stopPropagation();
    }, { capture: true });

    tab.addEventListener('mousedown', (e) => {
        if(url === document.activeElement) {
        openTab.dataset.focus = true;
        } else {
            openTab.removeAttribute('data-focus');
        }
    });

    tabWrapper.addEventListener('dragstart', (e) => {
        root.style.setProperty('--events', 'none');
        e.dataTransfer.effectAllowed = "move";
        const tab = e.currentTarget.childNodes[0];
        const data = {
            title: tab.dataset.title,
            url: tab.dataset.url,
            selection: tab.hasAttribute('data-selection') ? tab.dataset.selection : null,
            focus: tab.hasAttribute('data-focus') ? tab.dataset.focus : null,
            active: tab.hasAttribute('data-active') ? tab.dataset.active : null,
            windowId: window.windowId
        }

        e.dataTransfer.setData('json', JSON.stringify(data));
        e.stopPropagation();

        tabWrapper.addEventListener('drag', (e) => {
            e.target.classList.add('hidden');
        }, { once:true });
    }, true);

    tabWrapper.addEventListener('drop', (e) => {
        if(e.currentTarget == e.target) {
            e.currentTarget.classList.remove('dragover');
            const data = JSON.parse(e.dataTransfer.getData('json'));
            let tabWrapper = null;
            if(data.windowId == windowId) {
                tabWrapper = document.querySelector('.hidden');
            } else {
                tabWrapper = createTab(data.title, data.url, data.selection, data.focus);
                if(data.active) selectTab(tabWrapper);
                // window.electronAPI.loadUrl(data.url,tabWrapper.childNodes[0].id , windowId);
            }
            tabStorage.insertBefore(tabWrapper, e.currentTarget);
        }
        root.style.setProperty('--events', 'all');
        e.stopPropagation();
    }, true);

    tabWrapper.addEventListener('dragenter', (e) => {
        if(e.currentTarget == e.target) {
            e.currentTarget.classList.add('dragover');
        }
        
        e.stopPropagation();
    }, true);

    tabWrapper.addEventListener('dragleave', (e) => {
        if(e.currentTarget == e.target) {
            e.currentTarget.classList.remove('dragover');
        }
        
        e.stopPropagation();
    }, true);

    tabWrapper.addEventListener('dragend', (e) => {
        if(document.elementFromPoint(e.clientX, e.clientY) == null) {
            closeTab(e.target);
        } else {
            e.target.classList.remove('hidden');
        }
        root.style.setProperty('--events', 'all');
    });

    return tabWrapper;
}