import { unloadTab } from "./unloadTab.js";

export function closeTab(tabWrapper) {
    if(tabWrapper.childNodes[0].hasAttribute('data-active')) unloadTab(tabWrapper);
    tabWrapper.remove();
    if(document.getElementById('tabs-container').childElementCount <= 1) {
        window.electronAPI.closeWindow(window.windowId);
    }
}