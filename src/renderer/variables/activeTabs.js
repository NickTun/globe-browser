export let activeTabs = [];

export function pushTab(tab) {
    activeTabs.push(tab);
}

export function insertTab(index, tab) {
    activeTabs.splice(index, 0, tab);
}

export function spliceTab(index) {
    activeTabs.splice(index, 1);
}