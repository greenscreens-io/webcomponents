/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A module loading IPPPrinterAttributes class
 * 
 * @module ipp/IPPPrinterAttributes
 */
import { GSElement } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

/**
 * IPPPrinterAttributes UI lists printer attributes
 */
export default class IPPAttributes extends GSElement {

    static {
        customElements.define('gs-ipp-attributes', IPPAttributes);
        Object.seal(IPPAttributes);
    }

    async getTemplate() {
        return super.getTemplate('//ipp-printer-attributes.html');
    }

    onReady() {
        super.onReady();
        const me = this;
    }

    load(data) {
        if (!data) return;
        data = data['printer-attributes'] ||data;
        const list = Object.entries(data).map(t => { return {key: t[0], value : t[1]} } );
        this.#store.setData(list);
    }

    get #table() {
        return this.query('gs-table');
    }

    get #store() {
        return this.#table.store;
    }
}