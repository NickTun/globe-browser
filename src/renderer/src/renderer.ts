import { pushTab, insertTab, activeTabs } from '../variables/activeTabs'
import { openTab } from '../variables/openTab'
import { addTab } from '../functions/addTab'
import { selectTab } from '../functions/selectTab'
import { createTab } from '../functions/createTab'
import { tabSplitter, handleTabSplitter } from '../functions/handleTabSplitter'
import autoAnimate from '@formkit/auto-animate'
import animationParams from '../functions/animationParams'

const tabStorage = document.getElementById('tabs-container')
const urlWrapper = document.getElementById('url-wrapper')
const url = document.getElementById('url') as HTMLInputElement
const newTab = document.getElementById('new-tab')

declare global {
    interface Window { windowId: number | null }
}

window.windowId = null

window.electronAPI.onAquireId((id, data) => {
    if(!window.windowId) window.windowId = id
    const tab = addTab()
    if(data) {
        if(data.active) {
            pushTab(tab)
            tab.setAttribute('data-active', '')
            window.electronAPI.exchangeViews(data.tab_id, data.windowId, window.windowId)
        }
        tab.dataset.url = data.url
        tab.dataset.selection = String(data.selection)
        tab.dataset.focus = String(data.focus)
        tab.children[0].innerHTML = data.title
    }
    selectTab(tab)
    autoAnimate(tabStorage as HTMLElement, animationParams)

    window.electronAPI.onMenuStateChange((state) => {
        if(state) {
            document.body.classList.remove('hidden')
        } else {
            document.body.classList.add('hidden')
        }
    })

    window.electronAPI.onAquireTabTitle((title, tab_id) => {
        activeTabs[tab_id].children[0].innerHTML = title
    })

    window.electronAPI.onUrlChange((url_str, tab_id) => {
        activeTabs[tab_id].dataset.url = url_str
        url.value = url_str
    })
})



newTab?.addEventListener('click', () => {
    const tab = addTab()
    selectTab(tab)
})

newTab?.addEventListener('mousedown', () => {
    if(openTab) {
        if(url === document.activeElement) {
            openTab.setAttribute('data-focus', '')
        } else {
            openTab.removeAttribute('data-focus')
        }
    }
})

urlWrapper?.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    if(formData.get('url') != "") {
        if(!openTab?.hasAttribute('data-active')) {
            pushTab(openTab)
            openTab?.setAttribute('data-active', '')
            window.electronAPI.newTabView(formData.get('url') as string, window.windowId as number)
            window.electronAPI.selectTabView(activeTabs.indexOf(openTab as HTMLElement), window.windowId as number)
        } else {
            window.electronAPI.loadUrl(formData.get('url') as string, activeTabs.indexOf(openTab), window.windowId as number)
        }
    }
})

url.addEventListener('input', (e) => {
    if(openTab) openTab.dataset.url = (e.target as HTMLInputElement).value
})

url.addEventListener('selectionchange', (e) => {
    const target = e.target as HTMLInputElement
    if(e.isTrusted && openTab) openTab.dataset.selection = String([target.selectionStart, target.selectionEnd])
})

window.addEventListener('focus', () => {
    url.blur()
})

window.addEventListener('dragover', (e) => {
    e.preventDefault()
})

tabStorage?.addEventListener('dragenter', function (e) {
    if(!tabStorage.contains(e.relatedTarget as Node | null)) {
        this.addEventListener('dragover', () => {
            autoAnimate(tabStorage as HTMLElement, animationParams).enable()
        }, { once: true })
        
        window.electronAPI.setDraggedWindowStatus(window.windowId as number)
    }
    
    e.preventDefault()
}, true)

tabStorage?.addEventListener('dragover', function (e) {
    handleTabSplitter(e, this)
})

tabStorage?.addEventListener('dragleave', (e) => {
    if(!tabStorage.contains(e.relatedTarget as Node | null)) {
        autoAnimate(tabStorage as HTMLElement, animationParams).disable()
        window.electronAPI.setDraggedWindowStatus(-1)
        tabStorage.removeChild(tabSplitter)
        tabStorage.dataset.offset = "-1"
    }
    
    e.preventDefault()
}, true)

tabStorage?.addEventListener('drop', function (e) {
    if(e.dataTransfer?.getData('json')) {
        e.stopPropagation()
        const data = JSON.parse(e.dataTransfer?.getData('json'))
        const selectedTab = createTab(data.url, data.title, data.selection, data.focus, data.active) 

        this.insertBefore(selectedTab, tabSplitter)

        tabStorage.removeChild(tabSplitter)
        tabStorage.dataset.offset = "-1"

        if(data.active) {
            if(data.windowId == window.windowId) {
                insertTab(data.tab_id, selectedTab)
            } else {
                pushTab(selectedTab)
                window.electronAPI.exchangeViews(data.tab_id, data.windowId, window.windowId as number)
            }
        }

        if(data.open){
            selectTab(selectedTab)
        }
    }
}, true)