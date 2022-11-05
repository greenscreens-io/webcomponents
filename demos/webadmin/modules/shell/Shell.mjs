/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */


/**
 * A module loading BaseUI class
 * @module shell
 */

import {GSElement} from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

/**
 * Class representing UI Shell
 * @class
 * @extends {GSElement}
 */
export default class ShellUI extends GSElement {

    static {
        customElements.define('gs-admin-shell', ShellUI);
        Object.seal(ShellUI);
    }

    async getTemplate() {
        return super.getTemplate('//shell.html');
    }

    onReady() {
        super.onReady();
        const me = this;
        if (me.GSC?.company && me.company) me.company.innerHTML = me.GSC.company;
    }

    get company() {
        return this.getByID('company');
    }

    get GSC() {
        return globalThis.GSC;
    }

}
