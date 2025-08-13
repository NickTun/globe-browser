import { unloadTab } from "./unloadTab.js";

export function closeTab(tab) {
    if(tab.hasAttribute('data-active')) unloadTab(tab);
    tab.remove();
    if(document.getElementById('tabs-container').childElementCount <= 1) {
        window.electronAPI.closeWindow(window.windowId);
    }
}