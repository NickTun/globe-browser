const tabStorage = document.getElementById('tabs-container')
const url = document.getElementById('url')
import { activeTabs, spliceTab } from "../variables/activeTabs"
import { openTab } from '../variables/openTab'
import { closeTab } from './closeTab'
import { unloadTab } from './unloadTab'
import { handleTabClosure } from "./handleTabClosure"
import { pickTab } from "./pickTab.js"
import autoAnimate from "@formkit/auto-animate"
import animationParams from "./animationParams"

export function createTab(url_str="", title_str="New Tab", selection=[0, 0], focus=false, active=false): HTMLDivElement {
    const tab = document.createElement('div')
    const close = document.createElement('button')
    const unload = document.createElement('button')
    const title = document.createElement('h4')
    close.innerHTML = "x"
    unload.innerHTML = "u"
    tab.classList.add('tab')
    title.classList.add('tab-title')
    tab.appendChild(title)
    tab.appendChild(close)
    tab.appendChild(unload)
    tab.dataset.url = url_str
    tab.dataset.selection = String(selection)
    title.innerHTML = title_str
    if(focus) tab.setAttribute('data-focus', '')
    if(active) tab.setAttribute('data-active', '')
    tab.draggable = true

    tab.addEventListener('click', function () {
        pickTab(this)
    })

    close.addEventListener('click', (e) => {
        closeTab((e.target as HTMLElement).parentElement)
        e.stopPropagation()
    }, true)

    unload.addEventListener('click', (e) => {
        const target = e.target as HTMLInputElement
        if(target.parentElement?.hasAttribute('data-active')) {
            unloadTab(target.parentElement)
        }  
        e.stopPropagation()
    }, true)

    tab.addEventListener('mousedown', () => {
        if(url === document.activeElement) {
            openTab?.setAttribute('data-focus', '')
        } else {
            openTab?.removeAttribute('data-focus')
        }
    })

    tab.addEventListener('dragstart', function (e) {
        autoAnimate(tabStorage as HTMLElement, animationParams).disable();
        (e.dataTransfer as DataTransfer).effectAllowed = "move";
        (e.target as HTMLDivElement).classList.add('dragged')

        const data = {
            title: this.children[0].innerHTML,
            url: this.dataset.url,
            selection: this.hasAttribute('data-selection') ? this.dataset.selection : null,
            focus: this.hasAttribute('data-focus'),
            active: this.hasAttribute('data-active'),
            open: this.hasAttribute('data-open'),
            windowId: window.windowId as number,
            tab_id: activeTabs.indexOf(this)
        }

        const tab_position = Array.prototype.indexOf.call(tabStorage?.children, this);

        (e.dataTransfer as DataTransfer).setData('json', JSON.stringify(data))
        e.stopPropagation()

        this.addEventListener('drag', function () {
            if(data.active) spliceTab(activeTabs.indexOf(this))
            this.remove()
        }, { once:true })

        tab.addEventListener('dragend', async function() {
            this.classList.remove('dragged')
            const outside = await window.electronAPI.getDraggedWindowStatus()
            autoAnimate(tabStorage as HTMLElement, animationParams).enable()
            if(outside != window.windowId) {
                let flag = false
                if (outside == -1) { 
                    window.electronAPI.createWindow(data)
                    if(data.active) flag = true
                }
                handleTabClosure(tab_position, data.open, flag)
            }
        }, { once: true })
    }, true)

    return tab
}