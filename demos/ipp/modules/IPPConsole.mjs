/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A module loading IPPConsole class
 * 
 * @module ipp/IPPConsole
 */
import { GSElement } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

/**
 * IPPJobs UI lists printer jobs and allows job manupulation actions
 */
export default class IPPConsole extends GSElement {

    static {
        customElements.define('gs-ipp-console', IPPConsole);
        Object.seal(IPPConsole);
    }

    async getTemplate() {
        return super.getTemplate('//ipp-console.html');
    }

    onReady() {
        super.onReady();
        const me = this;
    }

    log(data = '') {
        this.#console.content = JSON.stringify(data, '', 4);
    }

    get #console() {
        return this.query('gs-highlight');
    }
}