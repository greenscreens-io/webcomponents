/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading BaseUI class
 * @module BaseUI
 */
import GSDOM from "../../../../modules/base/GSDOM.mjs";
import GSElement from "../../../../modules/base/GSElement.mjs";
import GSFunction from "../../../../modules/base/GSFunction.mjs";
import GSUtil from "../../../../modules/base/GSUtil.mjs";
import Utils from "../Utils.mjs";

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
        me.attachEvent(me, 'action', me.#onAction.bind(me));
        me.attachEvent(me.#table, 'filter', e => me.refresh());
        requestAnimationFrame(() => me.refresh());
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
        const flt = this.#table?.store.filter || [];
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
        return GSDOM.query(this.modal, '#form-main');
    }

    get waiter() {
        return GSComponents.get('modal-waiter');
    }

    /**
     * Record popup
     */
    get modal() {
        return this.query('#modal-main');
    }

    /**
     * Listener for lower componets "action" events
     * wihch might come from table fitlering, table context menut etc.
     * Used to handle context menu options. 
     * Action from context menu is mapped to this class function.
     * @param {Event} e 
     */
    async #onAction(e) {
        const me = this;
        if (!e.detail.action) return;
        try {
            const action = GSUtil.capitalizeAttr(e.detail.action);
            const fn = me[action];
            if (GSFunction.isFunction(fn)) {
                if (GSFunction.isFunctionAsync(fn)) {
                    await me[action](e);
                } else {
                    me[action](e);
                }
            }
        } catch (e) {
            Utils.handleError(e);
        }
    }

    /**
     * Export table data
     */
    async export() {
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
    async clone(e) {

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
            me.refresh();
        } catch (e) {
            Utils.handleError(e);
        }

    }

    /**
     * Table record action - remove record
     * @param {Event} e 
     * @returns {Promise}
     */
    async remove(e) {

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
            Utils.handleError(e);
        }

    }

    /**
     * Table record action - edit data
     * @param {Event} e 
     * @returns {Promise}
     */
    async details(e) {

        const me = this;
        const data = await me.onDetails(e.detail.data[0]);
        if (!data) return;

        me.form?.reset();
        GSDOM.fromObject(me.form, data);
        me.modal.open(data);
        const result = await me.modal.waitEvent('data');

        try {
            const sts = await me.onUpdate(result.data);
            if (!sts) throw new Error('Record not updated!');

            // update locally to refresh ui
            Object.assign(data, result.data);
            me.store.reload();
            Utils.notify.warn('', 'Record updated!');

        } catch (e) {
            Utils.handleError(e);
        }

    }

    /**
     * Toolbar table action - create record
     * @param {Event} e 
     * @returns {Promise}
     */
    async create(e) {

        const me = this;

        me.form?.reset();
        me.modal.open();
        const result = await me.modal.waitEvent('data');

        try {
            const sts = await me.onCreate(result.data);
            if (!sts) throw new Error('Record not created!');

            // update locally to refresh ui
            Utils.notify.primary('', 'Record created!');

            me.refresh();

        } catch (e) {
            Utils.handleError(e);
        }

    }

    /**
     * Toolbar table action - refresh data
     * @param {Event} e 
     */
    async refresh(e) {
        // get data from extension and populate table;
        const me = this;

        const data = await me.onLoad(e);

        if (!me.store) return;

        requestAnimationFrame(() => {
            try {
                if (data) {
                    me.store.setData(data);
                    // me.store.firstPage();
                } else {
                    me.store.reload();
                }
            } catch (e) {
                console.log(e);
            }
        });

    }

    /**
     * Toolbar table action - filter records
     * @param {Event} val 
     */
    search(e) {
        this.store.filter = e.detail.value;
    }

    /**
     * Handle data befoer opening the modal form
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

