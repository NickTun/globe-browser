const tabStorage = document.querySelector('.tabs-container');

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electronAPI.showContextMenu();
});

newTab = document.querySelector('.new-tab');
newTab.addEventListener('click', () => {
    window.electronAPI.newTabView();
    const tab = document.createElement('div');
    tab.classList.add('tab');
    tabStorage.appendChild(tab);
});