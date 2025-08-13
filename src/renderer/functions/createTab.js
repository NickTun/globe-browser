const tabStorage = document.getElementById('tabs-container');
const root = document.querySelector(':root');
const tabSplitter = document.getElementById('tab-splitter');
import { activeTabs } from "../variables/activeTabs.js";
import { openTab } from '../variables/openTab.js';
import { selectTab } from './selectTab.js';
import { closeTab } from './closeTab.js';
import { unloadTab } from './unloadTab.js';

export function createTab(url_str="", title_str="New Tab", selection=[0, 0], focus=false, active=false) {
    const tab = document.createElement('div');
    const close = document.createElement('button');
    const unload = document.createElement('button');
    const title = document.createElement('h4');
    close.innerHTML = "x";
    unload.innerHTML = "u";
    tab.classList.add('tab');
    tab.appendChild(title);
    tab.appendChild(close);
    tab.appendChild(unload);
    tab.dataset.url = url_str;
    tab.dataset.selection = selection;
    title.innerHTML = title_str
    if(focus) tab.dataset.focus = true;
    if(active) tab.dataset.active = true;
    tab.draggable = true;

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

    tab.addEventListener('dragstart', function (e) {
        e.dataTransfer.effectAllowed = "move";
        e.target.classList.add('dragged');
        const data = {
            title: this.childNodes[0].innerHTML,
            url: this.dataset.url,
            selection: this.hasAttribute('data-selection') ? this.dataset.selection : null,
            focus: this.hasAttribute('data-focus') ? this.dataset.focus : null,
            active: this.hasAttribute('data-active') ? this.dataset.active : null,
            windowId: window.windowId,
            tab_id: activeTabs.indexOf(this)
        }

        e.dataTransfer.setData('json', JSON.stringify(data));
        e.stopPropagation();

        this.addEventListener('drag', (e) => {
            e.target.classList.add('hidden');
            tabStorage.removeChild(e.target);
            tabStorage.appendChild(e.target);
        }, { once:true });

        tab.addEventListener('dragend', async (e) => {
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

    return tab;
}