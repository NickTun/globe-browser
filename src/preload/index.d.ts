import WindowTabInfo from '../types/WindowTabInfo'

export interface IElectronAPI {
  showContextMenu: (id: number) => Promise<void>,
  newTabView: (url: string, id: number) => Promise<void>,
  selectTabView: (tab_id: number, id: number) => Promise<void>,
  removeTabView: (tab_id: number, id: number) => Promise<void>,
  loadUrl: (url: string, tab_id: number, id: number) => Promise<void>,
  onAquireId: (callback: (id: number, data: WindowTabInfo) => void) => Promise<void>,
  onAquireTabTitle: (callback: (title: string, tab_id: number) => void) => Promise<void>,
  closeWindow: (id: number) => Promise<void>,
  createWindow: (data: WindowTabInfo) => Promise<void>,
  getDraggedWindowStatus: () => Promise<number>,
  setDraggedWindowStatus: (id: number) => Promise<void>,
  exchangeViews: (tab_id: number, id_from: number, id_to: number) => Promise<void>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onWindowCleanup: (callback: () => void) => Promise<void>,
  onUrlChange: (callback: (url: string, tab_id: number) => void) => Promise<void>,
  onMenuStateChange: (callback: (state: boolean) => void) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}