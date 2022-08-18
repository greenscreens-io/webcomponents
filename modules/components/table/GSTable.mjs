/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTable class
 * @module components/table/GSTable
 */

import GSComponents from "../../base/GSComponents.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSUtil from "../../base/GSUtil.mjs";

// use GSData
// - if data attr set to gs-data id find el
// - if internal gs-data el, use that

/**
 * Boottrap table WebComponent
 * @class
 * @extends {GSElement}
 */
export default class GSTable extends GSElement {

    #select = true;
    #multiselect = false;

    #headers = [];

    #data = [];
    #selected = [];

    #store = null;

    #map = {
        'css':'table',
        'css-header' : 'table thead',
        'css-row' : 'table tbody tr',
        'css-cell' : 'table tbody td'        
    };

    #selectCSS = 'bg-dark text-light fw-bold';
    #tableCSS = 'table table-hover table-striped user-select-none m-0';
    #headerCSS = 'user-select-none table-light';
    #rowCSS = '';
    #cellCSS = 'col';

    static {
        customElements.define('gs-table', GSTable);
    }

    static get observedAttributes() {
        const attrs = ['src', 'select', 'multiselect', 'css', 'css-header', 'css-row', 'css-cell', 'css-select'];
        return GSUtil.mergeArrays(attrs, GSElement.observedAttributes);
    }

    constructor() {
        super();
    }

    async getTemplate(val = '') {
        //return super.getTemplate(val || '//table.tpl');
        return super.getTemplate(val);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        me.#setCSS(me.map[name], newValue);
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
            const dataID = GSUtil.getAttribute('data');
            me.#store = await GSComponents.waitFor(dataID);
        }

        me.attachEvent(me.shadow, 'sort', e => me.#onColumnSort(e.detail));
        me.attachEvent(me.shadow, 'filter', e => me.#onColumnFilter(e.detail));
        me.attachEvent(me.shadow, 'select', e => me.#onRowSelect(e.detail));
        me.attachEvent(me.shadow, 'action', e => me.#onContextMenu(e.detail));
        me.attachEvent(me, 'data', e => me.#onData(e));

        me.store.page = 1;
        super.onReady();
    }

    get contextMenu() {
        return this.querySelector('gs-context');
    }

    get store() {
        const me = this;
        if (me.#store) return me.#store;

        me.#store = me.querySelector('gs-data');
        if (!me.#store) {
            const dataID = GSUtil.getAttribute('data');
            me.#store = GSComponents.get(dataID);
        }
        return me.#store;
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
        return GSUtil.getAttribute(this, 'css', this.#tableCSS); 
    }

    get cssSelect() { 
        return GSUtil.getAttribute(this, 'css-select', this.#selectCSS); 
    }

    get cssHeader() {
        return GSUtil.getAttribute(this, 'css-header', this.#headerCSS); 
    }
    
    get cssRow() { 
        return GSUtil.getAttribute(this, 'css-row', this.#rowCSS); 
    }
    
    get cssCell() { 
        return GSUtil.getAttribute(this, 'css-cell', this.#cellCSS); 
    }

    set css(val = '') {
        GSUtil.setAttribute(this, 'css', val); 
    }

    set cssSelect(val = '') {
        GSUtil.setAttribute(this, 'css-select', val); 
    }

    set cssHeader(val = '') {
        GSUtil.setAttribute(this, 'css-header', val); 
    }

    set cssRow(val = '') {
        GSUtil.setAttribute(this, 'css-row', val); 
    }

    set cssCell(val = '') {
        GSUtil.setAttribute(this, 'css-cell', val); 
    }

    #setCSS(qry, val) {
        if (!qry) return;
        this.findAll(qry, true).forEach(el => {
            GSUtil.setAttribute(el, 'class', val);
        });
    }

    #onData(e) {
        e.preventDefault();
        const me = this;
        me.#processData(e.detail);
        setTimeout(() => GSUtil.sendEvent(me.shadow, 'data', e.detail), 10);
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
        const hdr = me.querySelector('gs-header');
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
        const dom = GSUtil.parse(defs.join(''));
        me.appendChild(dom);
    }

    #renderPage() {
        const me = this;
        me.shadow.querySelector('tbody').render(me.#headers, me.#data, me.store.offset);
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
        me.shadow.innerHTML = `<table class="${me.css}">${html}<tbody is="gs-tbody"></tbody></table><slot name="extra"></slot>`;
    }

    #onContextMenu(data) {
        const me = this;
        const opt = { action: data.data.action, data: me.#selected };
        GSUtil.sendEvent(me, 'action', opt);
    }

    #onRowSelect(data = []) {
        const me = this;
        me.#selected = [];
        data.forEach(i => {
            const rec = me.#data[i];
            if (rec) me.#selected.push(rec);
        });
        GSUtil.sendEvent(me, 'selected', me.#selected);
    }

    #onColumnSort(data) {
        this.store.sort = data || [];
    }

    #onColumnFilter(data) {
        this.store.filter = data || [];
    }
}
