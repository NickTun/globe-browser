const tabStorage = document.getElementById('tabs-container');
let activeTabs = [];
let openTab = null;
let windowId = null;

window.electronAPI.onAquireId((id) => {
    if(!windowId) windowId = id;
    selectTab(addTab());
});

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

urlWrapper.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    window.electronAPI.loadUrl(formData.get('url'), openTab.id, windowId);
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

window.addEventListener('dragover', (e) => {
    e.preventDefault();
});

function createTab(title="New Tab", url_str="", selection=[0, 0], focus=false, active=false, id=null) {
    const tabWrapper = document.createElement('div');
    const tab = document.createElement('div');
    const close = document.createElement('button');
    const unload = document.createElement('button');
    close.innerHTML = "x";
    unload.innerHTML = "u";
    tab.classList.add('tab');
    tabWrapper.appendChild(tab);
    tabWrapper.classList.add('tab-wrapper');
    tab.appendChild(close);
    tab.appendChild(unload);
    tab.dataset.url = url_str;
    tab.dataset.selection = selection;
    tab.dataset.title = title;
    if(focus) tab.dataset.focus = true;
    if(active) tab.dataset.active = true;
    if(id) tab.id = id;
    tabWrapper.draggable = true;

    tab.addEventListener('click', (e) => {
        selectTab(e.target.parentElement)
    });

    close.addEventListener('click', (e) => {
        closeTab(e.target.parentElement.parentElement);
        e.stopPropagation();
    }, { capture: true });

    unload.addEventListener('click', (e) => {
        unloadTab(e.target.parentElement.parentElement);
        e.stopPropagation();
    }, { capture: true });

    tab.addEventListener('mousedown', (e) => {
        if(url === document.activeElement) {
        openTab.dataset.focus = true;
        } else {
            openTab.removeAttribute('data-focus');
        }
    });

    // tabWrapper.addEventListener('dragstart', (e) => {
    //     const tab = e.currentTarget.childNodes[0];
    //     const data = {
    //         title: tab.dataset.title,
    //         url: tab.dataset.url,
    //         selection: tab.hasAttribute('data-selection') ? tab.dataset.selection : null,
    //         focus: tab.hasAttribute('data-focus') ? tab.dataset.focus : null,
    //         active: tab.hasAttribute('data-active') ? tab.dataset.active : null,
    //         id: tab.hasAttribute('id') ? tab.id : null,
    //     }

    //     e.dataTransfer.setData('json', JSON.stringify(data));
    //     e.stopPropagation();
    // }, true);

    // tabWrapper.addEventListener('drop', (e) => {
    //     if(e.currentTarget == e.target) {
    //         e.currentTarget.childNodes[0].classList.remove('no-events');
    //         e.currentTarget.classList.remove('dragover');
    //         console.log(e.currentTarget, 'drop')
    //         const data = JSON.parse(e.dataTransfer.getData('json'));
    //         const tabWrapper = createTab(data.title, data.url, data.selection, data.focus, data.active, data.id);
    //         tabStorage.insertBefore(tabWrapper, e.currentTarget);
            
    //     }
    //     e.stopPropagation();
    // }, true);

    // tabWrapper.addEventListener('dragenter', (e) => {
    //     e.currentTarget.childNodes[0].classList.add('no-events');
    //     if(e.currentTarget == e.target) {
    //         e.currentTarget.classList.add('dragover');
    //     }
        
    //     e.stopPropagation();
    // }, true);

    // tabWrapper.addEventListener('dragleave', (e) => {
    //     if(e.currentTarget == e.target) {
    //         e.currentTarget.childNodes[0].classList.remove('no-events');
    //         e.currentTarget.classList.remove('dragover');
    //     }
        
    //     e.stopPropagation();
    // }, true);

    // tab.addEventListener('dragend', (e) => {
    //     console.log("dropped");
    // });

    return tabWrapper;
}

function addTab(tabWrapper = createTab()) {
    tabStorage.appendChild(tabWrapper);
    return tabWrapper;
}

function selectTab(tabWrapper) {
    const tab = tabWrapper.childNodes[0];
    if(!tab.hasAttribute('data-active')) {
        activeTabs.push(tab);
        tab.dataset.active = true;
        window.electronAPI.newTabView(tab.dataset.url, windowId);
        tab.id = activeTabs.length - 1;
    }
    window.electronAPI.selectTabView(tab.id, windowId);

    const range = tab.dataset.selection.split(",");
    const focus = tab.hasAttribute('data-focus');

    openTab = tab;
    url.value = tab.dataset.url;
    
    if(focus) {
        url.focus();
        url.setSelectionRange(Number(range[0]), Number(range[1]));
    }
}

function unloadTab(tabWrapper) {
    const tab = tabWrapper.childNodes[0];
    tab.removeAttribute('data-active');
    for (let i = Number(tab.id)+1; i <= activeTabs.length-1; i++) {
        activeTabs[i].id -= 1;
    }

    activeTabs.splice(tab.id, 1);
    window.electronAPI.removeTabView(tab.id, windowId);
    tab.removeAttribute('id');
}

function closeTab(tabWrapper) {
    if(tabWrapper.childNodes[0].hasAttribute('data-active')) unloadTab(tabWrapper);
    tabWrapper.remove();
}