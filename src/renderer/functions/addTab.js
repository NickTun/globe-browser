const tabStorage = document.getElementById('tabs-container');
import { createTab } from "./createTab.js";
export function addTab(url="") {
    const tab = createTab(url)
    tabStorage.appendChild(tab);
    return tab;
}