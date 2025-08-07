import { pushTab, activeTabs } from "../variables/activeTabs.js";
import { setOpenTab } from "../variables/openTab.js";

export function selectTab(tabWrapper) {
    const tab = tabWrapper.childNodes[0];
    if(!tab.hasAttribute('data-active')) {
        pushTab(tab);
        tab.dataset.active = true;
        window.electronAPI.newTabView(tab.dataset.url, window.windowId);
    }
    window.electronAPI.selectTabView(activeTabs.indexOf(tabWrapper.childNodes[0]), window.windowId);

    const range = tab.dataset.selection.split(",");
    const focus = tab.hasAttribute('data-focus');

    setOpenTab(tab);
    url.value = tab.dataset.url;
    
    if(focus) {
        url.focus();
        url.setSelectionRange(Number(range[0]), Number(range[1]));
    }
}