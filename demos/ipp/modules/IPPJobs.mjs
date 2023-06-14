/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A module loading IPPJobs class
 * 
 * @module ipp/IPPJobs
 */
import { GSElement } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

/**
 * IPPJobs UI lists printer jobs and allows job manupulation actions
 */
export default class IPPJobs extends GSElement {

    static {
        customElements.define('gs-ipp-jobs', IPPJobs);
        Object.seal(IPPJobs);
    }

    async getTemplate() {
        return super.getTemplate('//ipp-jobs.html');
    }

    onReady() {
        super.onReady();
        const me = this;
    }
    
    load(data) {
        if (!data) return;
        const me = this;
        me.#attrStore.clear();
        if (data.jobs) {
            me.#jobsStore.setData(data.jobs);
        }  else {
            me.#loadAttr(data);
        }
    }
    
    #loadAttr(data) {
        if (!data) return;
        data = data['job-attributes'] ||data;
        const list = Object.entries(data).map(t => { return {key: t[0], value : t[1]} } );
        this.#attrStore.setData(list);
    }

    get #jobsTable() {
        return this.query('#table-jobs');
    }

    get #jobsStore() {
        return this.#jobsTable.store;
    }

    get #attrTable() {
        return this.query('#table-job-attributes');
    }

    get #attrStore() {
        return this.#attrTable.store;
    }
}