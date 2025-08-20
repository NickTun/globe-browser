export const tabSplitter = document.createElement('div')
tabSplitter.classList.add('tab-splitter-open')

export function handleTabSplitter(e, tabStorage: HTMLElement): void {
    // const width = tabStorage.childElementCount > 0 ? (tabStorage.lastChild as HTMLElement).getBoundingClientRect().width : 120
    const width = 120
    const offset = Math.floor((e.clientX-tabStorage.getBoundingClientRect().x)/width)
    const data_offset = Number(tabStorage.dataset.offset)

    if(data_offset != offset) {
        if(data_offset != -1) {
            tabStorage.removeChild(tabSplitter)
        }

        if(tabStorage.childElementCount > 0) {
            tabStorage.insertBefore(tabSplitter, tabStorage.children[offset])
        } else {
            tabStorage.appendChild(tabSplitter)
        }

        tabStorage.dataset.offset = String(offset)
    }
}