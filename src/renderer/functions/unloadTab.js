import { spliceTab, activeTabs } from "../variables/activeTabs.js";

export function unloadTab(tab) {
    const index = activeTabs.indexOf(tab);
    tab.removeAttribute('data-active');

    spliceTab(index);
    window.electronAPI.removeTabView(index, window.windowId);
}