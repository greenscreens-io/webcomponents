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
}