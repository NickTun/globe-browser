import { pickTab } from "./pickTab.js";
const tabStorage = document.getElementById('tabs-container');

export function handleTabClosure(tab_index, wait) {
    if(tabStorage.childElementCount > 0) {
        if(tabStorage.children[tab_index]) {
            pickTab(tabStorage.children[tab_index]);
        } else {
            pickTab(tabStorage.children[tab_index-1]);
        }
    } else {
        if(wait) {
            window.electronAPI.onWindowCleanup(() => {
                window.electronAPI.closeWindow(window.windowId);
            });
        } else {
            window.electronAPI.closeWindow(window.windowId);
        }
    }
}