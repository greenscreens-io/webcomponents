/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading BaseUI class
 * @module BaseUI
 */
import GSElement from "../../../modules/base/GSElement.mjs";
import GSFunction from "../../../modules/base/GSFunction.mjs";

/**
 * BaseUI handles basic screen (used by other UI elements)
 * @class
 * @extends {GSElement}
 */
export default class BaseUI extends GSElement {

    constructor() {
        super();
        this.className = 'd-flex flex-fill';
    }

    onReady() {
        const me = this;
        me.attachEvent(me, 'action', me.#onAction.bind(me));
        super.onReady();
    }

    get #store() {
        return this.#table.store;
    }

    get #table() {
        return this.query('#table-main');
    }

    get #modal() {
        return this.query('#modal-main');
    }

    get #notify() {
        return GSComponents.get('notification');
    }

    /**
     * Listener for lower componets "action" events
     * wihch might come from table fitlering, table context menut etc.
     * Used to handle context menu options. 
     * Action from context menu is mapped to this class function.
     * @param {Event} e 
     */
    #onAction(e) {
        const action = e.detail.action;
        if (GSFunction.isFunction(this[action])) this[action](e);
    }

    /**
     * Table record action - clone record
     * @param {Event} e 
     * @returns {Promise}
     */
    async clone(e) {

        const me = this;
        const data = e.detail.data.pop();
        if (!data) return;

        const rec = Object.assign({}, data);
        rec.name = `${data.name} - ${Date.now()}`;

        try {

            const sts = await me.onCreate(rec);
            if (!sts) throw new Error('Record not cloned!');

            // update locally to refresh ui
            me.#store.setData(rec, true);
            me.#notify.secondary('', 'Record cloned!');

        } catch (e) {
            console.log(e);
            me.#notify.danger('', e.message || e.toString())
        }

    }

    /**
     * Table record action - remove record
     * @param {Event} e 
     * @returns {Promise}
     */
    async remove(e) {

        const me = this;
        const data = e.detail.data.pop();
        if (!data) return;

        try {

            const sts = await me.onRemove(data);
            if (!sts) throw new Error('Record not removed!');

            // update locally to refresh ui
            const subset = me.#store.data.filter(o => o.name !== data.name);
            me.#store.setData(subset);
            me.#notify.danger('', 'Record removed!');

        } catch (e) {
            console.log(e);
            me.#notify.danger('', e.message || e.toString())
        }

    }

    /**
     * Table record action - edit data
     * @param {Event} e 
     * @returns {Promise}
     */
    async details(e) {

        const me = this;
        const data = e.detail.data.pop();
        if (!data) return;

        const modal = me.#modal;
        const tab = modal.query('GS-TAB');
        if (tab) tab.index = 0;
        modal.open();
        const result = await modal.waitEvent('data');

        try {

            const sts = await me.onUpdate(result.detail.data);
            if (!sts) throw new Error('Record not updated!');

            modal.reset();
            // update locally to refresh ui
            Object.assign(data, result.detail.data);
            me.#store.reload();
            me.#notify.warn('', 'Record updated!');

        } catch (e) {
            console.log(e);
            me.#notify.danger('', e.message || e.toString())
        }

    }

    /**
     * Toolbar table action - create record
     * @param {Event} e 
     * @returns {Promise}
     */
    async create(e) {

        const me = this;

        const modal = me.#modal;
        const tab = modal.query('GS-TAB');
        if (tab) tab.index = 0;
        modal.open();
        const result = await modal.waitEvent('data');

        try {

            const sts = await me.onCreate(result.detail.data);
            if (!sts) throw new Error('Record not created!');
            modal.reset();
            // update locally to refresh ui
            me.#store.data.push(result.detail.data);
            me.#store.reload();
            me.#notify.primary('', 'Record created!');

        } catch (e) {
            console.log(e);
            me.#notify.danger('', e.message || e.toString())
        }

    }

    /**
     * Toolbar table action - refresh data
     * @param {Event} e 
     */
    refresh(e) {
        // get data from extension and populate table;
        const me = this;
        me.#store.clear();
        me.#store.reload();
    }

    /**
     * Toolbar table action - filter records
     * @param {Event} val 
     */
    search(e) {
        this.#store.filter = e.detail.value;
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
     * Used to handle record removeal received from table context menu option - remove.
     * @param {Object} data 
     * @returns {boolean}
     * @throws {Error}
     */    
    async onRemove(data) {
        return true;
    }
}

