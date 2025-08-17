import { handleTabClosure } from "./handleTabClosure.js";
import { unloadTab } from "./unloadTab.js";
const tabStorage = document.getElementById('tabs-container');

export function closeTab(tab) {
    if(tab.hasAttribute('data-active')) unloadTab(tab);
    const index = Array.prototype.indexOf.call(tabStorage.children, tab);
    console.log(index)
    tab.remove();
    handleTabClosure(index);
}