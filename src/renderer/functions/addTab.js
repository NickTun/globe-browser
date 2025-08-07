const tabStorage = document.getElementById('tabs-container');
import { createTab } from "./createTab.js";
export function addTab(tabWrapper = createTab()) {
    tabStorage.appendChild(tabWrapper);
    return tabWrapper;
}