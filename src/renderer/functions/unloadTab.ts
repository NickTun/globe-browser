import { spliceTab, activeTabs } from "../variables/activeTabs"

export function unloadTab(tab): void {
    const index = activeTabs.indexOf(tab)
    tab.removeAttribute('data-active')

    spliceTab(index)
    window.electronAPI.removeTabView(index, window.windowId as number)
}