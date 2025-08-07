export let activeTabs = [];

export function pushTab(tab) {
    activeTabs.push(tab);
}

export function spliceTab(index) {
    activeTabs.splice(index, 1);
}