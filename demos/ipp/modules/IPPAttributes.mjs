/*
* Copyright (C) 2015, 2024 Green Screens Ltd.
*/

/**
 * A module loading IPPPrinterAttributes class
 * 
 * @module ipp/IPPPrinterAttributes
 */

import { GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";
/**
 * IPPPrinterAttributes UI lists printer attributes
 */
export class IPPAttributes extends GSElement {

    constructor() {
        super();
        this.template = '//ipp-printer-attributes.html';
    }

    renderUI() {
        return this.renderTemplate();
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

    static {
        GSElement.define('gs-ipp-attributes', IPPAttributes);
    }

}