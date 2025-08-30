import { handleTabClosure } from "./handleTabClosure"
import { unloadTab } from "./unloadTab"
const tabStorage = document.getElementById('tabs-container')

export function closeTab(tab): void {
    if(tab.hasAttribute('data-active')) unloadTab(tab)
    const index = Array.prototype.indexOf.call(tabStorage?.children, tab)
    const isOpen = tab.hasAttribute('data-open')
    tab.remove()
    handleTabClosure(index, isOpen)
}