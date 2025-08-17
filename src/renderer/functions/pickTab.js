import { pushTab } from "../variables/activeTabs.js";
import { selectTab } from "./selectTab.js";

export function pickTab(tab) {
    if(!tab.hasAttribute('data-active') && tab.dataset.url != "") {
        pushTab(tab);
        tab.dataset.active = true;
        window.electronAPI.newTabView(tab.dataset.url, window.windowId);
    }
    selectTab(tab);
}