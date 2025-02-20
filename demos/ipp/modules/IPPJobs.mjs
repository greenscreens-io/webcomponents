/*
* Copyright (C) 2015, 2024 Green Screens Ltd.
*/

/**
 * A module loading IPPJobs class
 * 
 * @module ipp/IPPJobs
 */
import { Utils } from './Utils.mjs';
import { BaseView } from './BaseView.mjs';

/**
 * IPPJobs UI lists printer jobs and allows job manupulation actions
 */
export class IPPJobs extends BaseView {

    constructor() {
        super();
        this.template = '//ipp-jobs.html';
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

    onCancelJob(e) {

    }
    
    onPrintUri(e) {

    }

    onPurgeJobs(e) {
        this.#jobsStore.clear();
    }

    async onDetails(e) {
        const jobs = await Utils.load('./data/job-attributes.json');
        this.load(jobs);
    }

    async onRefresh(e) {
        const jobs = await Utils.load('./data/jobs.json');
        this.load(jobs);
    }

    static {
        BaseView.define('gs-ipp-jobs', IPPJobs);
    }

}