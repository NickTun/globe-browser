const tabStorage = document.getElementById('tabs-container');
import { createTab } from "./createTab.js";
export function addTab(url="") {
    const tabWrapper = createTab(url)
    tabStorage.appendChild(tabWrapper);
    return tabWrapper;
}