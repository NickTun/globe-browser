import { handleTabAbsence } from "./handleTabAbsence.js";
import { unloadTab } from "./unloadTab.js";

export function closeTab(tab) {
    if(tab.hasAttribute('data-active')) unloadTab(tab);
    tab.remove();
    handleTabAbsence();
}