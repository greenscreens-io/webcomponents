/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading BaseUI class
 * @module BaseUI
 */
import GSDOM from "../../../modules/base/GSDOM.mjs";
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
        this.className = 'w-100';
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
        return this.findEl('#table-main');
    }

    get #modal() {
        return this.findEl('#modal-main');
    }

    get #form() {
        return GSComponents.query('#form-main');
    }

    get #notify() {
        return GSComponents.get('notification');
    }

    #onAction(e) {
        const action = e.detail.action;
        if (GSFunction.isFunction(this[action])) this[action](e);
    }

    /**
     * Table record action - clone record
     * @param {*} e 
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
     * @param {*} e 
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
     * @param {*} e 
     */
    async details(e) {
        const me = this;
        const data = e.detail.data.pop();
        if (!data) return;

        me.#form.reset();
        GSDOM.fromObject(me.#form, data);
        me.#modal.open();
        const result = await me.#modal.waitEvent('data');

        try {

            const sts = await me.onUpdate(result.data);
            if (!sts) throw new Error('Record not updated!');

            // update locally to refresh ui
            Object.assign(data, result.data);
            me.#store.reload();
            me.#notify.warn('', 'Record updated!');

        } catch (e) {
            console.log(e);
            me.#notify.danger('', e.message || e.toString())
        }

    }

    /**
     * Toolbar table action - create record
     * @param {*} e 
     */
    async create(e) {

        const me = this;

        me.#form.reset();
        me.#modal.open();
        const result = await me.#modal.waitEvent('data');

        try {

            const sts = await me.onCreate(result.data);
            if (!sts) throw new Error('Record not created!');

            // update locally to refresh ui
            me.#store.data.push(result.data);
            me.#store.reload();
            me.#notify.primary('', 'Record created!');

        } catch (e) {
            console.log(e);
            me.#notify.danger('', e.message || e.toString())
        }

    }

    /**
     * Toolbar table action - refresh data
     * @param {*} e 
     */
    refresh(e) {
        // get data from extension and populate table;
        const me = this;
        me.#store.clear();
        me.#store.reload();
    }

    /**
     * Toolbar table action - filter records
     * @param {*} val 
     */
    search(e) {
        this.#store.filter = e.detail.value;
    }

    async onCreate(data) {
        return true;
    }

    async onUpdate(data) {
        return true;
    }

    async onRemove(data) {
        return true;
    }
}
