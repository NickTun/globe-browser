const tabStorage = document.getElementById('tabs-container');
let activeTabs = [];
let openTab = null;

newTab = document.getElementById('new-tab');
newTab.addEventListener('click', () => {
    selectTab(addTab());
});

newTab.addEventListener('mousedown', (e) => {
    if(openTab) {
        if(url === document.activeElement) {
            openTab.dataset.focus = true;
        } else {
            openTab.removeAttribute('data-focus');
        }
    }
});

urlWrapper = document.getElementById('url-wrapper');
url = document.getElementById('url');

selectTab(addTab());

urlWrapper.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    window.electronAPI.loadUrl(formData.get('url'));
});

url.addEventListener('input', (e) => {
    openTab.dataset.url = e.target.value;
});

url.addEventListener('selectionchange', (e) => {
    if(e.isTrusted) openTab.dataset.selection = [e.target.selectionStart, e.target.selectionEnd];
});

window.addEventListener('focus', (e) => {
    url.blur();
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
    tab.dataset.url = "";
    tab.dataset.selection = [0, 0];
    tab.tabIndex = 0;
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

    tab.addEventListener('mousedown', (e) => {
        if(url === document.activeElement) {
        openTab.dataset.focus = true;
        } else {
            openTab.removeAttribute('data-focus');
        }
    });

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

    const range = tab.dataset.selection.split(",");
    const focus = tab.hasAttribute('data-focus');

    openTab = tab;
    url.value = tab.dataset.url;
    
    if(focus) {
        url.focus();
        url.setSelectionRange(Number(range[0]), Number(range[1]));
    }
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