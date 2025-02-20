/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading BaseUI class
 * @module BaseUI
 */

import { GSFunction, GSDOM, GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

/**
 * BaseUI handles basic screen (used by other UI elements)
 * @class
 * @extends {GSElement}
 */
export class BaseUI extends GSElement {

    #listener = null;
    #data = null;

    constructor() {
        super();
        this.className = 'd-flex flex-fill';
    }

    connectedCallback() {
        const me = this;
        me.#listener = me.#onRuntimeMessage.bind(me);
        chrome?.runtime?.onMessage?.addListener(me.#listener);
        super.connectedCallback();
    }

    disconnectedCallback() {
        const me = this;
        chrome?.runtime?.onMessage?.removeListener(me.#listener);
        me.#listener = null;
        super.disconnectedCallback();
    }

    renderUI() {
        return this.renderTemplate();
    }

    firstUpdated() {
        super.firstUpdated();
        const me = this;
        me.attachEvent(me, 'action', me.#onAction.bind(me));
    }

    get store() {
        return this.#table.dataController.store;
    }

    get #table() {
        return this.query('#table-main', true);
    }

    get #modal() {
        return this.query('#modal-main', true);
    }

    get #notify() {
        return GSDOM.query('#notification');
    }

    get #selected() {
        return this.#table.selected[0];
    }

    /**
     * Listener for lower componets "action" events
     * wihch might come from table fitlering, table context menut etc.
     * Used to handle context menu options. 
     * Action from context menu is mapped to this class function.
     * @param {Event} e 
     */
    #onAction(e) {
        const action = e.detail.action || e.detail;
        if (GSFunction.isFunction(this[action])) this[action](e);
    }

    #onRuntimeMessage(req) {
        const me = this;
        if (req.key === 'conf' && req.cmd === 'refresh' && req.data) {
            me.#data = req.data;
            me.onData(req.data);
            me.#notify.secondary('', 'Data refreshed!');
        }
    }

    get service() {
        return this.#data.settings?.service;
    }

    get data() {
        return this.#data;
    }
    
    /**
     * Table record action - clone record
     * @param {Event} e 
     * @returns {Promise}
     */
    async clone(e) {

        const me = this;
        const data = me.#selected;
        if (!data) return;

        const rec = Object.assign({}, data);
        rec.name = `${data.name} - ${Date.now()}`;

        try {

            const sts = await me.onCreate(rec);
            if (!sts) throw new Error('Record not cloned!');

            // update locally to refresh ui
            me.store.append?.(rec);
            me.store.read();
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
        const data = me.#selected;
        if (!data) return;

        try {

            const sts = await me.onRemove(data);
            if (!sts) throw new Error('Record not removed!');

            // update locally to refresh ui
            me.store.remove?.(data);
            me.store.read();
            me.#notify.danger('', 'Record removed!');

        } catch (e) {
            console.log(e);
            me.#notify.danger('', e.message || e.toString())
        }

    }

    /**
     * Generic function to be overriden by inherited class
     * Used to handle record received from backend.
     * @param {Object} data 
     * @returns {boolean}
     * @throws {Error}
     */
    onData(data) {
        return true;
    }    

    /**
     * Table record action - edit data
     * @param {Event} e 
     * @returns {Promise}
     */
    async details(e) {

        const me = this;
        const data = me.#selected;
        if (!data) return;

        const modal = me.#modal;
        const tab = modal.query('gs-tab', true);
        if (tab) tab.index = 0;

        const frm = modal.query('gs-form', true);
        if(frm)  {
            frm.data = {};
            frm.data = data;
        }

        modal.open();
        const result = await modal.waitEvent('data');

        try {

            const sts = await me.onUpdate(result.detail);
            if (!sts) throw new Error('Record not updated!');

            modal.reset();
            // update locally to refresh ui
            Object.assign(data, result.detail);
            me.store.read();
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
        const tab = modal.query('GS-TAB', true);
        if (tab) tab.index = 0;

        const frm = modal.query('gs-form', true);
        if(frm) frm.reset();

        modal.open();
        const result = await modal.waitEvent('data');

        try {

            const sts = await me.onCreate(result.detail.data);
            if (!sts) throw new Error('Record not created!');
            modal.reset();
            // update locally to refresh ui
            me.store.data.push(result.detail.data);
            me.store.read();
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
        const store = me.store;
        store.clear?.();
        store.read();
        Messenger.load();
    }

    /**
     * Toolbar table action - filter records
     * @param {Event} val 
     */
    search(e) {
        const store = this.store;
        store.filter = e.detail.value;
        store.read();
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

