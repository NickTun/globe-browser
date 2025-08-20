export const activeTabs: Array<HTMLElement> = []

export function pushTab(tab): void {
    activeTabs.push(tab)
}

export function insertTab(index, tab): void {
    activeTabs.splice(index, 0, tab)
}

export function spliceTab(index): void {
    activeTabs.splice(index, 1)
}