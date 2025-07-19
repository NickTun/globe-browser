const { WebContentsView } = require('electron/main');

export class Tab extends WebContentsView {
    constructor(index) {
        this.index = index;
    }

    get id() {
        return this.index;
    }

    set id(id) {
        this.index = id;
    }
}