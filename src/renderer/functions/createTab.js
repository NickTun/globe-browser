const tabStorage = document.getElementById('tabs-container');
const root = document.querySelector(':root');
const tabSplitter = document.getElementById('tab-splitter');
import { openTab } from '../variables/openTab.js';
import { selectTab } from './selectTab.js';
import { closeTab } from './closeTab.js';
import { unloadTab } from './unloadTab.js';

export function createTab(url_str="", title_str="New Tab", selection=[0, 0], focus=false, active=false) {
    const tabWrapper = document.createElement('div');
    const tab = document.createElement('div');
    const close = document.createElement('button');
    const unload = document.createElement('button');
    const title = document.createElement('h4');
    close.innerHTML = "x";
    unload.innerHTML = "u";
    tab.classList.add('tab');
    tabWrapper.appendChild(tab);
    tabWrapper.classList.add('tab-wrapper');
    tab.appendChild(title);
    tab.appendChild(close);
    tab.appendChild(unload);
    tab.dataset.url = url_str;
    tab.dataset.selection = selection;
    title.innerHTML = title_str
    if(focus) tab.dataset.focus = true;
    if(active) tab.dataset.active = true;
    tabWrapper.draggable = true;

    tab.addEventListener('click', function (e) {
        selectTab(this.parentElement);
    });

    close.addEventListener('click', (e) => {
        closeTab(e.target.parentElement.parentElement);
        e.stopPropagation();
    }, true);

    unload.addEventListener('click', (e) => {
        unloadTab(e.target.parentElement.parentElement);
        e.stopPropagation();
    }, true);

    tab.addEventListener('mousedown', (e) => {
        if(url === document.activeElement) {
            openTab.dataset.focus = true;
        } else {
            openTab.removeAttribute('data-focus');
        }
    });

    tabWrapper.addEventListener('dragstart', function (e) {
        e.dataTransfer.effectAllowed = "move";
        e.target.classList.add('dragged');
        const tab = e.currentTarget.childNodes[0];
        const data = {
            title: tab.childNodes[0].innerHTML,
            url: tab.dataset.url,
            selection: tab.hasAttribute('data-selection') ? tab.dataset.selection : null,
            focus: tab.hasAttribute('data-focus') ? tab.dataset.focus : null,
            active: tab.hasAttribute('data-active') ? tab.dataset.active : null,
            windowId: window.windowId
        }

        e.dataTransfer.setData('json', JSON.stringify(data));
        e.stopPropagation();

        this.addEventListener('drag', (e) => {
            e.target.classList.add('hidden');
            tabStorage.removeChild(e.target);
            tabStorage.appendChild(e.target);
        }, { once:true });

        tabWrapper.addEventListener('dragend', async (e) => {
            e.target.classList.remove('dragged');
            tabSplitter.classList.remove('tab-splitter-open');
            const outside = await window.electronAPI.getDraggedWindowStatus();
            if(outside == window.windowId) {
                e.target.classList.remove('hidden');
            } else if (outside == -1) {
                window.electronAPI.createWindow(data);
                closeTab(e.target);
            } else {
                closeTab(e.target);
            }
        }, { once: true });
    }, true);

    return tabWrapper;
}