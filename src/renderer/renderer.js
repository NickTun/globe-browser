const tabStorage = document.getElementById('tabs-container');
let activeTabs = [];
let openTab = null;
let windowId = null;
const root = document.querySelector(':root');

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
    window.electronAPI.loadUrl(formData.get('url'), activeTabs.indexOf(openTab), windowId);
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

tabStorage.addEventListener('dragover', (e) => {
    root.style.setProperty('--events', 'none');
    e.preventDefault();
});

function createTab(title="New Tab", url_str="", selection=[0, 0], focus=false, active=false) {
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

    tabWrapper.addEventListener('dragstart', (e) => {
        root.style.setProperty('--events', 'none');
        e.dataTransfer.effectAllowed = "move";
        const tab = e.currentTarget.childNodes[0];
        const data = {
            title: tab.dataset.title,
            url: tab.dataset.url,
            selection: tab.hasAttribute('data-selection') ? tab.dataset.selection : null,
            focus: tab.hasAttribute('data-focus') ? tab.dataset.focus : null,
            active: tab.hasAttribute('data-active') ? tab.dataset.active : null,
            windowId: windowId
        }

        e.dataTransfer.setData('json', JSON.stringify(data));
        e.stopPropagation();

        tabWrapper.addEventListener('drag', (e) => {
            e.target.classList.add('hidden');
        }, { once:true });
    }, true);

    tabWrapper.addEventListener('drop', (e) => {
        if(e.currentTarget == e.target) {
            e.currentTarget.classList.remove('dragover');
            const data = JSON.parse(e.dataTransfer.getData('json'));
            let tabWrapper = null;
            if(data.windowId == windowId) {
                tabWrapper = document.querySelector('.hidden');
            } else {
                tabWrapper = createTab(data.title, data.url, data.selection, data.focus);
                selectTab(tabWrapper);
                // window.electronAPI.loadUrl(data.url,tabWrapper.childNodes[0].id , windowId);
            }
            tabStorage.insertBefore(tabWrapper, e.currentTarget);
        }
        root.style.setProperty('--events', 'all');
        e.stopPropagation();
    }, true);

    tabWrapper.addEventListener('dragenter', (e) => {
        if(e.currentTarget == e.target) {
            e.currentTarget.classList.add('dragover');
        }
        
        e.stopPropagation();
    }, true);

    tabWrapper.addEventListener('dragleave', (e) => {
        if(e.currentTarget == e.target) {
            e.currentTarget.classList.remove('dragover');
        }
        
        e.stopPropagation();
    }, true);

    tabWrapper.addEventListener('dragend', (e) => {
        if(document.elementFromPoint(e.clientX, e.clientY) == null) {
            closeTab(e.target);
        } else {
            e.target.classList.remove('hidden');
        }
        root.style.setProperty('--events', 'all');
    });

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
        // tab.id = activeTabs.length - 1;
    }
    window.electronAPI.selectTabView(activeTabs.indexOf(tabWrapper.childNodes[0]), windowId);

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
    const index = activeTabs.indexOf(tabWrapper.childNodes[0]);
    tab.removeAttribute('data-active');

    activeTabs.splice(index, 1);
    window.electronAPI.removeTabView(index, windowId);
}

function closeTab(tabWrapper) {
    if(tabWrapper.childNodes[0].hasAttribute('data-active')) unloadTab(tabWrapper);
    tabWrapper.remove();
}