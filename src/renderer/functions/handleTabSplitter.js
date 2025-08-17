export const tabSplitter = document.createElement('div');
tabSplitter.classList.add('tab-splitter-open');

export function handleTabSplitter(e, tabStorage) {
    const width = tabStorage.childElementCount > 0 ? tabStorage.lastChild.getBoundingClientRect().width : 120;
    const offset = Math.floor((e.clientX-tabStorage.getBoundingClientRect().x)/width);

    if(tabStorage.dataset.offset != offset) {
        if(tabStorage.dataset.offset != -1) {
            tabStorage.removeChild(tabSplitter);
        }

        if(tabStorage.childElementCount > 0) {
            tabStorage.insertBefore(tabSplitter, tabStorage.children[offset]);
        } else {
            tabStorage.appendChild(tabSplitter);
        }

        tabStorage.dataset.offset = offset;
    }
}