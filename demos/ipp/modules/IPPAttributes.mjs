/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A module loading IPPAttributes class
 * @module ipp/IPPAttributes
 */
import { GSElement } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

/**
 * IPPAttributes UI displays printer attributes
 */
export default class IPPAttributes extends GSElement {

    static {
        customElements.define('gs-ipp-attributes', IPPAttributes);
        Object.seal(IPPAttributes);
    }

    async getTemplate() {
        return super.getTemplate('//ipp-attributes.html');
    }

    onReady() {
        super.onReady();
        const me = this;
    }

}