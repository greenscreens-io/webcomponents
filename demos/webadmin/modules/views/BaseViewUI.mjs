/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading BaseUI class
 * @module BaseUI
 */

import { GSComponents, GSUtil, GSElement, GSEvents, GSAttr } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

import Utils from "../utils/Utils.mjs";

/**
 * BaseUI handles basic screen data view (used by other UI elements)
 * @class
 * @extends {GSElement}
 */
export default class BaseViewUI extends GSElement {

    constructor() {
        super();
        this.className = 'd-flex flex-fill';
    }
    

    onReady() {
        const me = this;
        super.onReady();
        globalThis.GS_LOG_ACTION = true;
        GSEvents.monitorAction(me, 'view');
        requestAnimationFrame(() => {
            if (!me.#table) return;
			me.store.filter = me.#table.filters;
			me.store.sort = me.#table.sorters;
			me.onViewRefresh();
		});       
    }

    /**
     * Record key field
     */
    get recID() {
        return 'id';
    }

    /**
     * Table data filter
     */
    get filter() {
        const flt = this.store?.filter || [];
        const obj = {};
        flt.forEach(o => obj[o.name] = o.value);
        return obj;
    }

    /**
     * Table data store
     */
    get store() {
        return this.#table?.store;
    }

    get #table() {
        return this.query('#table-main');
    }

    get form() {
        return this.modal?.form;
    }

    get waiter() {
        return Utils.waiter;
    }

    /**
     * Record popup
     */
    get modal() {
        return this.query('#modal-main');
    }

    /**
     * Export table data
     */
    async onViewExport() {
        const me = this;
        const name = me.tagName.toLowerCase();
        const data = me.store.data;
        GSUtil.export([JSON.stringify(data)], `${name}.json`);
    }

    /**
     * Table record action - clone record
     * @param {Event} e 
     * @returns {Promise}
     */
    async onViewClone(e) {

        const me = this;
        const data = e.detail.data[0];
        if (!data) return;

        const rec = Object.assign({}, data);

        try {

            const sts = await me.onClone(rec);
            if (!sts) throw new Error('Record not cloned!');

            // update locally to refresh ui
            me.store.setData(rec, true);
            Utils.notify.secondary('', 'Record cloned!');
            me.onViewRefresh();
        } catch (e) {
            me.onError(e);
        }

    }

    /**
     * Table record action - remove record
     * @param {Event} e 
     * @returns {Promise}
     */
    async onViewRemove(e) {

        const me = this;
        const data = e.detail.data[0];
        if (!data) return;

        try {

            const sts = await me.onRemove(data);
            if (!sts) throw new Error('Record not removed!');

            // update locally to refresh ui
            const subset = me.store.data.filter(o => !o.hasOwnProperty(me.recID) || (o[me.recID] !== data[me.recID]));
            me.store.setData(subset);
            Utils.notify.danger('', 'Record removed!');

        } catch (e) {
            me.onError(e);
        }

    }

    /**
     * Table record action - edit data
     * @param {Event} e 
     * @returns {Promise}
     */
    async onViewDetails(e) {

        const me = this;
        const data = await me.onDetails(e.detail.data[0]);
        if (!data) return;

        const modal = me.modal;
        modal.open(data);
        const result = await modal.waitEvent('data');

        try {
            const sts = await me.onUpdate(result.data);
            if (!sts) throw new Error('Record not updated!');

            modal.reset();
            // update locally to refresh ui
            Object.assign(data, result.data);
            me.store.load();
            Utils.notify.warn('', 'Record updated!');

        } catch (e) {
            me.onError(e);
        }

    }

    /**
     * Toolbar table action - create record
     * @param {Event} e 
     * @returns {Promise}
     */
    async onViewCreate(e) {

        const me = this;

        const modal = me.modal;
        const tab = modal.query('GS-TAB');
        if (tab) tab.index = 0;
        modal.open();
        const result = await modal.waitEvent('data');

        try {
            const sts = await me.onCreate(result.data);
            if (!sts) throw new Error('Record not created!');

            // update locally to refresh ui
            Utils.notify.primary('', 'Record created!');
            
            modal.reset();
            me.onViewRefresh(e);

        } catch (e) {
            me.onError(e);
        }

    }

    /**
     * Toolbar table action - refresh data
     * @param {Event} e 
     */
    async onViewRefresh(e) {
        // get data from extension and populate table;
        const me = this;

        const data = await me.onLoad(e);

        if (!me.store) return;

        try {
            if (Array.isArray(data) && data.length > 0) {
                me.store.setData(data);
                // me.store.firstPage();
            } else {
                me.store.read();
            }
        } catch (e) {
            me.onError(e);
        }

    }

    /**
     * Toolbar table action - filter records
     * @param {Event} val 
     */
    onViewSearch(e) {
        const me = this;
        me.store.filter = e.detail.value;
        me.store.read();
    }

	onError(e) {
        Utils.handleError(e);
    }

    /**
     * Handle data before opening the modal form
     * @param {*} data 
     * @returns 
     */
    async onDetails(data) {
        return data;
    }

    /**
     * Generic function to be overriden by inherited class
     * Used to handle new record received from popup form.
     * @param {Object} data 
     * @returns {boolean}
     * @throws {Error}
     */
    async onCreate(data) {
        return true;
    }

    /**
     * Generic function to be overriden by inherited class
     * Used to handle new record cloned from existing one.
     * @param {Object} data 
     * @returns {boolean}
     * @throws {Error}
     */
    async onClone(data) {
        return true;
    }

    /**
     * Generic function to be overriden by inherited class
     * Used to handle existing record change received from popup form.
     * @param {Object} data 
     * @returns {boolean}
     * @throws {Error}
     */
    async onUpdate(data) {
        return true;
    }

    /**
     * Generic function to be overriden by inherited class
     * Used to handle record removal received from table context menu option - remove.
     * @param {Object} data 
     * @returns {boolean}
     * @throws {Error}
     */
    async onRemove(data) {
        return true;
    }

    /**
     * Called to load view data
     * @returns {Array<Object>}
     * @throws {Error}
     */
    async onLoad(e) {
        return false;
    }
}

