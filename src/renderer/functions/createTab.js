const tabStorage = document.getElementById('tabs-container');
const tabSplitter = document.getElementById('tab-splitter');
import { pushTab, activeTabs, spliceTab } from "../variables/activeTabs.js";
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
        if(!tab.hasAttribute('data-active')) {
            pushTab(tab);
            tab.dataset.active = true;
            window.electronAPI.newTabView(tab.dataset.url, window.windowId);
        }
        selectTab(this);
    });

    close.addEventListener('click', (e) => {
        closeTab(e.target.parentElement);
        e.stopPropagation();
    }, true);

    unload.addEventListener('click', (e) => {
        unloadTab(e.target.parentElement);
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
            tabSplitter.classList.add('tab-splitter-open');
            spliceTab(activeTabs.indexOf(e.target));
            e.target.remove();
        }, { once:true });

        tab.addEventListener('dragend', async (e) => {
            e.target.classList.remove('dragged');
            tabSplitter.classList.remove('tab-splitter-open');
            const outside = await window.electronAPI.getDraggedWindowStatus();
            if(outside == window.windowId) {
                console.log("inner movement");
            } else if (outside == -1) {
                // window.electronAPI.createWindow(data);
                // closeTab(e.target);
                console.log("new window");
            } else {
                console.log("existing window")
                // closeTab(e.target);
            }
        }, { once: true });
    }, true);

    return tab;
}