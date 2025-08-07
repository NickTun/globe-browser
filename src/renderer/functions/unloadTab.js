import { spliceTab, activeTabs } from "../variables/activeTabs.js";

export function unloadTab(tabWrapper) {
    const tab = tabWrapper.childNodes[0];
    const index = activeTabs.indexOf(tab);
    tab.removeAttribute('data-active');

    spliceTab(index);
    window.electronAPI.removeTabView(index, window.windowId);
}