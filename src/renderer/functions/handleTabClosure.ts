import { pickTab } from "./pickTab"
import { openTab } from "../variables/openTab"
const tabStorage = document.getElementById('tabs-container')


export function handleTabClosure(tab_index: number, isOpen: boolean, wait: boolean = false): void {
    if(wait) {
        window.electronAPI.onWindowCleanup(() => {
            handler(tab_index, isOpen)
        })
    } else {
        handler(tab_index, isOpen)
    }
}

function handler(tab_index, isOpen): void {
    if(tabStorage?.childElementCount as number > 0) {
        if(isOpen) {
            if(tabStorage?.children[tab_index]) {
                pickTab(tabStorage?.children[tab_index])
            } else {
                pickTab(tabStorage?.children[tab_index-1])
            }
        } else pickTab(openTab)
    } else {
        window.electronAPI.closeWindow(window.windowId as number)
    }
}