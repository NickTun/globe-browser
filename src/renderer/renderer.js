const tabStorage = document.querySelector('.tabs-container');
let activeTabs = [];

newTab = document.querySelector('.new-tab');
newTab.addEventListener('click', () => {
    selectTab(addTab());
});

function addTab() {
    const tab = document.createElement('div');
    const close = document.createElement('button');
    const unload = document.createElement('button');
    close.innerHTML = "x";
    unload.innerHTML = "u";
    tab.classList.add('tab');
    tab.appendChild(close);
    tab.appendChild(unload);
    tabStorage.appendChild(tab);
    tab.addEventListener('click', (e) => {
        selectTab(e.target)
    });
    close.addEventListener('click', (e) => {
        closeTab(e.target.parentElement);
        e.stopPropagation();
    }, { capture: true });
    unload.addEventListener('click', (e) => {
        unloadTab(e.target.parentElement);
        e.stopPropagation();
    }, { capture: true });
    return tab;
}

function selectTab(tab) {
    if(!tab.hasAttribute('data-active')) {
        activeTabs.push(tab);
        tab.dataset.active = true;
        window.electronAPI.newTabView();
        tab.id = activeTabs.length - 1;
    }
    window.electronAPI.selectTabView(tab.id);
}

function unloadTab(tab) {
    tab.removeAttribute('data-active');
    for (let i = Number(tab.id)+1; i <= activeTabs.length-1; i++) {
        activeTabs[i].id -= 1;
    }

    activeTabs.splice(tab.id, 1);
    window.electronAPI.removeTabView(tab.id);
    tab.removeAttribute('id');
}

function closeTab(tab) {
    if(tab.hasAttribute('data-active')) unloadTab(tab);
    tab.remove();
}