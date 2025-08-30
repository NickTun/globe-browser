export const tabSplitter = document.createElement('div')
tabSplitter.classList.add('tab-splitter-open')

export function handleTabSplitter(e, tabStorage: HTMLElement): void {
    // const width = tabStorage.childElementCount > 0 ? (tabStorage.lastChild as HTMLElement).getBoundingClientRect().width : 120
    const height = 40
    const offset = Math.floor((e.clientY-tabStorage.getBoundingClientRect().y)/height)
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