/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A module loading IPPView class
 * @module ipp/IPPView
 */
import { GSElement } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

export default class IPPView extends GSElement {

    static {
        customElements.define('gs-ipp-view', IPPView);
        Object.seal(IPPView);
    }

    async getTemplate() {
        return super.getTemplate('//ipp-view.html');
    }

    onReady() {
        super.onReady();
        const me = this;
    }

    get #console() {
        return this.query('#log');
    }

    get #attributes() {
        return this.query('gs-ipp-attributes');
    }

    get #jobs() {
        return this.query('gs-ipp-jobs');
    }
}