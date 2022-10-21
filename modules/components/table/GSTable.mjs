/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTable class
 * @module components/table/GSTable
 */

import GSAttr from "../../base/GSAttr.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSEvent from "../../base/GSEvent.mjs";
import GSUtil from "../../base/GSUtil.mjs";

// use GSStore
// - if data attr set to gs-store id find el
// - if internal gs-store el, use that

/**
 * Boottrap table WebComponent
 * @class
 * @extends {GSElement}
 */
export default class GSTable extends GSElement {

    static #tagList = ['GS-HEADER', 'GS-STORE'];
    #select = true;
    #multiselect = false;

    #headers = [];

    #data = [];
    #selected = [];

    #store = null;

    #map = {
        'css': 'table',
        'css-header': 'table thead',
        'css-row': 'table tbody tr',
        'css-cell': 'table tbody td'
    };

    #selectCSS = 'bg-dark text-light fw-bold';
    #tableCSS = 'table table-hover table-striped user-select-none m-0';
    #headerCSS = 'user-select-none table-light';
    #rowCSS = '';
    #cellCSS = 'col';

    static {
        customElements.define('gs-table', GSTable);
        Object.seal(GSTable);
    }

    static get observedAttributes() {
        const attrs = ['src', 'select', 'multiselect', 'css', 'css-header', 'css-filter', 'css-columns', 'css-row', 'css-cell', 'css-select'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        this.#validateAllowed();
    }

    #validateAllowed() {
        const me = this;
        let list = Array.from(me.children).filter(el => el.slot && el.slot !== 'extra');
        if (list.length > 0) throw new Error(`Custom element injection must contain slot="extra" attribute! Element: ${me.tagName}, ID: ${me.id}`);
        list = Array.from(me.childNodes).filter(el => !el.slot);
        const allowed = GSDOM.isAllowed(list, GSTable.#tagList);
        if (!allowed) throw new Error(GSDOM.toValidationError(me, GSTable.#tagList));
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        me.#setCSS(me.#map[name], newValue);
    }

    disconnectedCallback() {
        const me = this;
        me.#headers = [];
        me.#data = [];
        me.#selected = [];
        me.#store = null;
        super.disconnectedCallback();
    }

    async onReady() {
        const me = this;

        const store = me.store;
        if (!store) {
            const dataID = GSAttr.get('data');
            me.#store = await GSComponents.waitFor(dataID);
        }

        super.onReady();
        if (me.contextMenu) me.contextMenu.disabled = true;
        me.attachEvent(me.self, 'sort', e => me.#onColumnSort(e.detail));
        me.attachEvent(me.self, 'filter', e => me.#onColumnFilter(e.detail));
        me.attachEvent(me.self, 'select', e => me.#onRowSelect(e.detail));
        me.attachEvent(me.self, 'action', e => me.#onContextMenu(e));
        me.attachEvent(me, 'data', e => me.#onData(e));

        me.store.page = 1;
    }

    get contextMenu() {
        return this.querySelector('gs-context');
    }

    get store() {
        const me = this;
        if (me.#store) return me.#store;

        me.#store = me.querySelector('gs-store');
        if (!me.#store) {
            const dataID = GSAttr.get('data');
            me.#store = GSDOM.query(`gs-data#${dataID}`);
        }
        return me.#store;
    }

    get header() {
        return this.querySelector('gs-header');
    }

    /**
     * Selected records
     */
    get selected() {
        return this.#selected;
    }

    /**
     * If multi row select is enabled
     */
    get multiselect() {
        return this.#multiselect;
    }

    set multiselect(val = false) {
        const me = this;
        me.#multiselect = GSUtil.asBool(val);
    }

    /**
     * If row select is enabled
     */
    get select() {
        return this.#select;
    }

    set select(val = true) {
        const me = this;
        me.#select = GSUtil.asBool(val);
    }

    get css() {
        return GSAttr.get(this, 'css', this.#tableCSS);
    }

    get cssSelect() {
        return GSAttr.get(this, 'css-select', this.#selectCSS);
    }

    get cssHeader() {
        return GSAttr.get(this, 'css-header', this.#headerCSS);
    }

    get cssRow() {
        return GSAttr.get(this, 'css-row', this.#rowCSS);
    }

    get cssCell() {
        return GSAttr.get(this, 'css-cell', this.#cellCSS);
    }

    get cssFilter() {
        return GSAttr.get(this, 'css-filter', '');
    }

    get cssColumns() {
        return GSAttr.get(this, 'css-columns', '');
    }

    set css(val = '') {
        GSAttr.set(this, 'css', val);
    }

    set cssSelect(val = '') {
        GSAttr.set(this, 'css-select', val);
    }

    set cssHeader(val = '') {
        GSAttr.set(this, 'css-header', val);
    }

    set cssFilter(val = '') {
        GSAttr.set(this, 'css-filter', val);
    }

    set cssColumns(val = '') {
        GSAttr.set(this, 'css-columns', val);
    }

    set cssRow(val = '') {
        GSAttr.set(this, 'css-row', val);
    }

    set cssCell(val = '') {
        GSAttr.set(this, 'css-cell', val);
    }

    get noDataText() {
        return GSAttr.get(this, 'no-data', 'No Data');
    }

    set noDataText(val) {
        return GSAttr.set(this, 'no-data', val);
    }

    get isFilterable() {
        return this.#headers.filter(o => o.filter).length > 0;
    }

    #setCSS(qry, val) {
        if (!qry) return;
        this.findAll(qry, true).forEach(el => {
            GSAttr.set(el, 'class', val);
        });
    }

    #onData(e) {
        GSEvent.prevent(e);
        const me = this;
        if (!me.self) return;
        me.#processData(e.detail);
        GSEvent.sendDelayed(10, me.self, 'data', e.detail);
    }

    #processData(data) {
        const me = this;
        me.#data = data;
        me.#selected = [];
        if (!me.#hasHeaders) {
            me.#prepareHeaders();
            me.#renderTable();
            return requestAnimationFrame(() => me.#processData(data));
        }

        requestAnimationFrame(() => me.#renderPage());

    }

    get #hasHeaders() {
        return this.#headers.length > 0;
    }

    #prepareHeaders() {
        const me = this;
        const hdr = me.header;
        me.#headers = hdr ? hdr.toJSON() : [];
        if (me.#headers.length > 0) return;
        if (me.#data.length === 0) return;
        me.#recToHeader(me.#data[0]);
    }

    #recToHeader(rec) {
        const me = this;
        const defs = [];
        defs.push('<gs-header>');
        if (Array.isArray(rec)) {
            defs.push('<gs-column name="#"></gs-column>');
            rec.forEach((v, i) => {
                const html = `<gs-column name="Col_${i + 1}" index=${i}></gs-column>`;
                defs.push(html);
            });
        } else {
            Object.keys(rec).forEach(v => {
                const html = `<gs-column name="${v}"></gs-column>`;
                defs.push(html);
            });
        }
        defs.push('</gs-header>');
        const dom = GSDOM.parse(defs.join(''), true);
        me.appendChild(dom);
    }

    #renderPage() {
        const me = this;
        me.self.querySelector('tbody').render(me.#headers, me.#data, me.store.offset);
        const ctx = me.contextMenu;
        if (ctx) {
            ctx.close();
            ctx.reattach();
        }
    }

    #renderTable() {
        const me = this;
        if (!me.#hasHeaders) return;
        const html = me.querySelector('gs-header').render();
        const src = `<table class="${me.css}">${html}<tbody is="gs-tbody"></tbody></table><slot name="extra"></slot>`;
        GSDOM.setHTML(me.self, src);
    }

    /**
     * Just update (override) event data, and let it bubble up
     * @param {*} e 
     */
    #onContextMenu(e) {
        const me = this;
        const o = e.detail;
        o.action = o.data.action;
        // clone to prevent removing data by client code
        o.data = [...me.#selected];
        o.type = 'table';
        //const opt = { action: data.data.action, data: me.#selected };
        //GSEvent.send(me, 'action', opt, true, true, true);
    }

    #onRowSelect(data) {
        const me = this;
        me.#selected = [];
        data.data?.forEach(i => {
            const rec = me.#data[i];
            if (rec) me.#selected.push(rec);
        });
        if (me.contextMenu) me.contextMenu.disabled = data.data?.length === 0;
        GSEvent.send(me, 'selected', { data: me.#selected, evt: data.evt });
    }

    #onColumnSort(data) {
        const me = this;
        me.store.sort = data || [];
        GSEvent.send(me, 'sort', me.store.sort);
    }

    #onColumnFilter(data) {
        const me = this;
        me.store.filter = data || [];
        GSEvent.send(me, 'filter', me.store.filter);
    }
}

