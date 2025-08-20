const tabStorage = document.getElementById('tabs-container')
import { createTab } from "./createTab"
export function addTab(url=""): HTMLDivElement {
    const tab = createTab(url)
    tabStorage?.appendChild(tab)
    return tab
}