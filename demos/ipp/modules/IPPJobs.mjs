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

    templateInjected() {
        const me = this;
        me.#jobsTable.on('select', me.onDetails.bind(me));
    }

    load(data) {
        if (!data) return;
        const me = this;        
        me.#attrTable.data = [];
        if (data.jobs) {
            this.#loadData(this.#jobsTable, data.jobs);
        }  else {
            me.#loadAttr(data);
        }
    }
    
    #loadAttr(data) {
        if (!data) return;
        data = data['job-attributes'] ||data;
        const list = Object.entries(data).map(t => { return {key: t[0], value : t[1]} } );
        this.#loadData(this.#attrTable, list);
    }

    #loadData(table, data) {
        const controller = table.dataController;
        controller.store?.clear?.();
        controller.write(data);
        controller.read();
    }

    get #jobsTable() {
        return this.query('#table-jobs', true);
    }

    get #attrTable() {
        return this.query('#table-job-attributes', true);
    }

    onCancelJob(e) {

    }
    
    onPrintUri(e) {

    }

    onPurgeJobs(e) {
        this.#jobsTable.data = [];
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