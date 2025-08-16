const { BaseWindow, WebContentsView, Menu } = require('electron/main');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..', '..');

const TAB_TOP_OFFSET = 70;
class Window {
    constructor(id, data) {
        this.id = id;
        this.activeTab = 0;
        this.viewStorage = [];

        this.win = new BaseWindow({
            titleBarStyle: 'hiddenInset',
            ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
            icon: path.join(rootDir, 'src', 'resources', 'icon.icns'),
        })

        this.view = new WebContentsView({
            webPreferences: {
                preload: path.join(rootDir, 'src', 'preload', 'preload.js')
            }
        })

        this.win.contentView.addChildView(this.view);
        this.view.webContents.loadURL(`file://${path.join(rootDir, 'src', 'renderer', 'index.html')}`);
        this.Resize(this.win.getBounds(), this.view, 0);
        // this.view.webContents.openDevTools({mode: 'detach'});

        this.win.on('resize', () => {
            this.viewStorage.forEach((webView) => {
                this.Resize(this.win.getBounds(), webView, TAB_TOP_OFFSET);
            });
            this.Resize(this.win.getBounds(), this.view, 0);
        });

        this.view.webContents.on('did-finish-load', () => {
            this.view.webContents.send('aquire-id', this.id, data);
        });

        this.win.on('closed', () => {
            this.view.webContents.close()
        });
    }

    handleTitleChange(tab) {
        this.view.webContents.send('aquire-tab-title', tab.webContents.getTitle());
    }

    Resize(bounds, obj, offset) {
        obj.setBounds({ x: 0, y: 0 + offset, width: bounds.width, height: bounds.height - offset })
    }

    refreshTabViews(prevActive, active) {
        if(this.viewStorage[prevActive]) this.viewStorage[prevActive].setVisible(false);
        if(this.viewStorage[active]) this.viewStorage[active].setVisible(true);
    }

    addNewTab() {
        const webView = new WebContentsView();
        this.win.contentView.addChildView(webView);
        webView.webContents.addListener('context-menu', () => {
        drawMenu(webView);
        })
        this.Resize(this.win.getBounds(), webView, TAB_TOP_OFFSET);
        this.viewStorage.push(webView);

        webView.webContents.on('page-title-updated', () => this.handleTitleChange(webView));

        return this.viewStorage.length - 1;
    }

    drawMenu(target) {
        const template = [
        {
            label: 'Reload',
            click: () => { target.webContents.reload(); }
        },
        {
            label: 'Inspect Element',
            click: () => { target.webContents.openDevTools(); }
        }
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup();
    }

    loadViewURL(url, tab_id) {
        this.viewStorage[tab_id].webContents.loadURL(url);
    }

    selectTabView(tab_id) {
        this.refreshTabViews(this.activeTab, tab_id);
        this.activeTab = tab_id;
    }

    removeTabView(tab_id) {
        this.viewStorage[tab_id].webContents.close();
        if(tab_id < this.activeTab) this.activeTab -= 1;
        this.viewStorage.splice(tab_id, 1);
    }

    closeWindow() {
        this.viewStorage.forEach((webView) => {
            webView.webContents.close();
        });
        this.win.close();
    }

    getTab(tab_id) {
        const tab = this.viewStorage[tab_id];
        this.viewStorage.splice(tab_id, 1);
        this.win.contentView.removeChildView(tab);
        tab.webContents.removeAllListeners('page-title-updated');
        this.view.webContents.send('window-cleanup');
        return tab;
    }

    pushTab(tab) {
        this.win.contentView.addChildView(tab);
        this.Resize(this.win.getBounds(), tab, TAB_TOP_OFFSET);
        this.viewStorage.push(tab);
        this.selectTabView(this.viewStorage.length - 1);
        tab.webContents.on('page-title-updated', () => this.handleTitleChange(tab));
    }
}

module.exports = { Window }