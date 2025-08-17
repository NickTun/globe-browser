const tabStorage = document.getElementById('tabs-container');
import { activeTabs, spliceTab } from "../variables/activeTabs.js";
import { openTab } from '../variables/openTab.js';
import { closeTab } from './closeTab.js';
import { unloadTab } from './unloadTab.js';
import { handleTabClosure } from "./handleTabClosure.js";
import { pickTab } from "./pickTab.js";
import { handleTabSplitter } from "./handleTabSplitter.js";

export function createTab(url_str="", title_str="New Tab", selection=[0, 0], focus=false, active=false) {
    const tab = document.createElement('div');
    const close = document.createElement('button');
    const unload = document.createElement('button');
    const title = document.createElement('h4');
    close.innerHTML = "x";
    unload.innerHTML = "u";
    tab.classList.add('tab');
    title.classList.add('tab-title');
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
        pickTab(this);
    });

    close.addEventListener('click', (e) => {
        closeTab(e.target.parentElement);
        e.stopPropagation();
    }, true);

    unload.addEventListener('click', (e) => {
        if(e.target.parentElement.hasAttribute('data-active')) {
            unloadTab(e.target.parentElement);
        }  
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
            title: this.children[0].innerHTML,
            url: this.dataset.url,
            selection: this.hasAttribute('data-selection') ? this.dataset.selection : null,
            focus: this.hasAttribute('data-focus') ? this.dataset.focus : null,
            active: this.hasAttribute('data-active') ? this.dataset.active : null,
            windowId: window.windowId,
            tab_id: activeTabs.indexOf(this)
        }

        const tab_position = Array.prototype.indexOf.call(tabStorage.children, this);

        e.dataTransfer.setData('json', JSON.stringify(data));
        e.stopPropagation();

        this.addEventListener('drag', function (e) {
            if(data.active) spliceTab(activeTabs.indexOf(this));
            this.remove();
        }, { once:true });

        tab.addEventListener('dragend', async function(e) {
            this.classList.remove('dragged');
            const outside = await window.electronAPI.getDraggedWindowStatus();
            if(outside != window.windowId) {
                let flag = false;
                if (outside == -1) { 
                    window.electronAPI.createWindow(data);
                    if(data.active) flag = true;
                }
                handleTabClosure(tab_position, flag);
            }
        }, { once: true });
    }, true);

    return tab;
}