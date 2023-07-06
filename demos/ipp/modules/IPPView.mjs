/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A module loading IPPView class
 * @module ipp/IPPView
 */
import Utils from './Utils.mjs';
import BaseView from './BaseView.mjs';

export default class IPPView extends BaseView {

    static {
        customElements.define('gs-ipp-view', IPPView);
        Object.seal(IPPView);
    }

    async getTemplate() {
        return super.getTemplate('//ipp-view.html');
    }

    get #attributes() {
        return this.query('gs-ipp-attributes');
    }

    get #jobs() {
        return this.query('gs-ipp-jobs');
    }

    get uri() {
        return this.query('#printerURI')?.value || '';
    }

    async onRegister() {
        this.onRefresh();
    }

    async onRefresh() {
        const me = this;
        const data = await Utils.load('./data/printer-attributes.json');
        me.#attributes.load(data);

        const jobs = await Utils.load('./data/jobs.json');
        me.#jobs.load(jobs);
    }

}