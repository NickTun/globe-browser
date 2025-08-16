const tabStorage = document.getElementById('tabs-container');
export function handleTabAbsence(wait=false) {
    if(tabStorage.childElementCount <= 1) {
        if(wait) {
            window.electronAPI.onWindowCleanup(() => {
                window.electronAPI.closeWindow(window.windowId);
            });
        } else {
            window.electronAPI.closeWindow(window.windowId);
        }
        
    }
}