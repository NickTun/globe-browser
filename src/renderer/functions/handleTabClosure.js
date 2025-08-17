import { pickTab } from "./pickTab.js";
import { openTab } from "../variables/openTab.js";
const tabStorage = document.getElementById('tabs-container');


export function handleTabClosure(tab_index, isOpen, wait) {
    if(wait) {
        window.electronAPI.onWindowCleanup(() => {
            handler(tab_index, isOpen);
        });
    } else {
        handler(tab_index, isOpen);
    }
}

function handler(tab_index, isOpen) {
    if(tabStorage.childElementCount > 0) {
        if(isOpen) {
            if(tabStorage.children[tab_index]) {
                pickTab(tabStorage.children[tab_index]);
            } else {
                pickTab(tabStorage.children[tab_index-1]);
            }
        } else pickTab(openTab);
    } else {
        window.electronAPI.closeWindow(window.windowId);
    }
}