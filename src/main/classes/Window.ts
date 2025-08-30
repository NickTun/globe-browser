import { BaseWindow, WebContentsView, Menu, screen } from 'electron/main'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import WindowTabInfo from '../../types/WindowTabInfo'
import icon from '../../../build/icon.png?asset'

const OFFSET = {
    border: 4,
    y: 0,
}

const RADIUS = 8
const MENU_WIDTH = 180

export default class Window {
    id: number
    activeTab: number
    viewStorage: Array<WebContentsView>
    win: BaseWindow
    view: WebContentsView
    tabListState: boolean
    tabListOpen: boolean
    constructor(id: number, data: WindowTabInfo | null, tabListState: boolean = false) {
        this.id = id
        this.activeTab = 0
        this.viewStorage = []
        this.tabListOpen = false
        this.tabListState = tabListState

        this.win = new BaseWindow({
            titleBarStyle: 'hiddenInset',
            ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
            ...(process.platform === 'linux' ? { icon } : {}),
            // transparent: true,
            // backgroundColor: "#00000000"
        })
        process.platform === 'darwin' && this.win.setVibrancy("under-window")

        this.view = new WebContentsView({
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
            }
        })

        this.view.setBackgroundColor('#00000000');

        this.win.contentView.addChildView(this.view)
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            this.view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
        } else {
            this.view.webContents.loadFile(join(__dirname, '../renderer/index.html'))
        }
        this.Resize(this.win.getBounds(), this.view)
        // this.view.webContents.openDevTools({mode: 'detach'})

        this.win.on('resize', () => {
            this.viewStorage.forEach((webView) => {
                this.Resize(this.win.getBounds(), webView, OFFSET)
            })
            this.Resize(this.win.getBounds(), this.view)
        })

        this.view.webContents.on('did-finish-load', () => {
            this.view.webContents.send('aquire-id', this.id, data)
        })

        this.win.on('closed', () => {
            this.view.webContents.close()
        })

        this.win.on('focus', () => {
            const mos = setInterval(() => {
                this.handleMouseMovement()
            }, 50)

            this.win.on('blur', () => setTimeout(() =>clearInterval(mos), 50))
        })
    }

    handleTitleChange(tab: WebContentsView): void {
        this.view.webContents.send('aquire-tab-title', tab.webContents.getTitle(), this.viewStorage.indexOf(tab))
    }

    handleUrlChange(tab: WebContentsView): void {
        this.view.webContents.send('url-change', tab.webContents.getURL(), this.viewStorage.indexOf(tab))
    }

    Resize(bounds, obj, offset={ border: 0, y: 0 }): void {
        obj.setBounds({
            x: 0 + offset.border,
            y: 0 + offset.y + offset.border,
            width: bounds.width - offset.border*2,
            height: bounds.height - offset.y - offset.border * 2
        })
    }

    handleMouseMovement(): void {
        const mouse = screen.getCursorScreenPoint()
        const x = mouse.x - this.win.getBounds().x
        if(this.tabListOpen) {
            if(x > MENU_WIDTH) {
                this.view.setBounds({
                    x: 0,
                    y: 0,
                    width: 4,
                    height: this.win.getBounds().height
                })
                this.view.webContents.send('menu-state-change', false)
                this.win.setWindowButtonVisibility(false)
                this.tabListOpen = false
            }
        } else {
            if(x <= 4) {
                this.view.setBounds({
                    x: 0,
                    y: 0,
                    width: MENU_WIDTH,
                    height: this.win.getBounds().height
                })
                this.view.webContents.send('menu-state-change', true)
                this.win.setWindowButtonVisibility(true)
                this.tabListOpen = true
            }
        }
    }

    refreshTabViews(prevActive: number, active: number): void {
        if(this.viewStorage[prevActive]) this.viewStorage[prevActive].setVisible(false)
        if(this.viewStorage[active]) this.viewStorage[active].setVisible(true)
    }

    addNewTab(): number {
        const webView = new WebContentsView()
        webView.setBorderRadius(RADIUS)
        this.win.contentView.addChildView(webView, 0)

        webView.webContents.addListener('context-menu', () => {
            this.drawMenu(webView)
        })

        webView.webContents.on('did-navigate', () => this.handleUrlChange(webView))

        this.Resize(this.win.getBounds(), webView, OFFSET)
        this.viewStorage.push(webView)

        webView.webContents.on('page-title-updated', () => this.handleTitleChange(webView))

        return this.viewStorage.length - 1
    }

    drawMenu(target): void {
        const template = [
        {
            label: 'Reload',
            click: () => { target.webContents.reload() }
        },
        {
            label: 'Inspect Element',
            click: () => { target.webContents.openDevTools() }
        }
        ]
        const menu = Menu.buildFromTemplate(template)
        menu.popup()
    }

    loadViewURL(url, tab_id): void {
        this.viewStorage[tab_id].webContents.loadURL(url)
    }

    selectTabView(tab_id): void {
        this.refreshTabViews(this.activeTab, tab_id)
        this.activeTab = tab_id
    }

    removeTabView(tab_id): void {
        this.viewStorage[tab_id].webContents.close()
        if(tab_id < this.activeTab) this.activeTab -= 1
        this.viewStorage.splice(tab_id, 1)
    }

    closeWindow(): void {
        this.viewStorage.forEach((webView) => {
            webView.webContents.close()
        })
        this.win.close()
    }

    getTab(tab_id): WebContentsView {
        const tab = this.viewStorage[tab_id]
        this.viewStorage.splice(tab_id, 1)
        this.win.contentView.removeChildView(tab)
        tab.webContents.removeAllListeners('page-title-updated')
        tab.webContents.removeAllListeners('did-navigate')
        this.view.webContents.send('window-cleanup')
        return tab
    }

    pushTab(tab): void {
        this.win.contentView.addChildView(tab)
        this.Resize(this.win.getBounds(), tab, OFFSET)
        this.viewStorage.push(tab)
        tab.webContents.on('page-title-updated', () => this.handleTitleChange(tab))
        tab.webContents.on('did-navigate', () => this.handleUrlChange(tab))
    }
}