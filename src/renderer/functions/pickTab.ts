import { pushTab } from "../variables/activeTabs"
import { selectTab } from "./selectTab"

export function pickTab(tab): void {
    if(!tab.hasAttribute('data-active') && tab.dataset.url != "") {
        pushTab(tab)
        tab.dataset.active = true
        window.electronAPI.newTabView(tab.dataset.url, window.windowId as number)
    }
    selectTab(tab)
}