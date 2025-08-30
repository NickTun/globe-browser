import { activeTabs } from "../variables/activeTabs"
import { openTab, setOpenTab } from "../variables/openTab"

export function selectTab(tab): void {
    const url = document.getElementById('url') as HTMLInputElement
    window.electronAPI.selectTabView(activeTabs.indexOf(tab), window.windowId as number)

    const range = tab.dataset.selection.split(",")
    const focus = tab.hasAttribute('data-focus')

    openTab?.removeAttribute('data-open')
    tab.setAttribute('data-open', "" )
    setOpenTab(tab)
    
    url.value = tab.dataset.url
    
    if(focus) {
        url.focus()
        url.setSelectionRange(Number(range[0]), Number(range[1]))
    }
}