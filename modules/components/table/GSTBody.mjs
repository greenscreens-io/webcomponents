/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTBody class
 * @module components/table/GSTBody
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSListeners from "../../base/GSListeners.mjs";
import GSComponents from "../../base/GSComponents.mjs";

/**
 * Bootstrap table bod renderer
 * <tbody is="gs-tbody"></tbody>
 * @class
 * @extends {HTMLTableSectionElement}
 */
export default class GSTBody extends HTMLTableSectionElement {

    #table = null;

    static {
        customElements.define('gs-tbody', GSTBody, { extends: 'tbody' });
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSListeners.attachEvent(me, me, 'click', e => me.#onClick(e));
        GSListeners.attachEvent(me, me, 'contextmenu', e => me.#onMenu(e), false, true);
        GSComponents.store(me);
        me.#table = GSComponents.getOwner(me);
    }

    disconnectedCallback() {
        const me = this;
        me.#table = null;
        GSComponents.remove(me);
        GSListeners.deattachListeners(me);
    }

    get index() {
        return this.table.index;
    }

    get cssCell() {
        return this.table.cssCell;
    }

    get cssRow() {
        return this.table.cssRow;
    }

    get cssSelect() {
        return this.table.cssSelect;
    }

    get select() {
        return this.table.select;
    }

    get multiselect() {
        return this.table.multiselect;
    }

    get table() {
        return this.#table || GSComponents.getOwner(this);
    }

    render(headers, data, offset) {

        const me = this;
        if (!Array.isArray(headers)) return;

        const rows = [];
        let html = '';

        data.forEach((rec, idx) => {
            rows.push(`<tr class="${me.cssRow}">`);

            if (Array.isArray(rec)) {
                html = me.#arrayToHTML(headers, rec, idx, offset);
            } else {
                html = me.#objToHTML(headers, rec, offset);
            }

            rows.push(html);
            rows.push('</tr>');
        });

        me.innerHTML = rows.join('');
        GSUtil.findAll('tr', me, true).forEach(el => { if (el.innerText.trim().length === 0) el.remove(); });
    }

    #arrayToHTML(headers, rec, idx, offset) {
        const me = this;
        const cols = [];
        headers.forEach(hdr => {
            const c = hdr.name === "#" ? (idx + 1 + offset).toString() : rec[hdr.idx];
            cols.push(`<td class="${me.cssCell}">${c || '&nbsp;'}</td>`);

        });

        return cols.join('');
    }

    #objToHTML(headers, rec, offset) {
        const me = this;
        const cols = [];
        headers.forEach((hdr, i) => {
            const html = me.#genRow(hdr, rec, i + 1 + offset);
            cols.push(html);
        });
        return cols.join('');
    }

    #genRow(hdr, rec, idx) {
        const me = this;
        const val = hdr.name === "#" ? idx : rec[hdr.name];
        return `<td class="${me.cssCell}">${val || '&nbsp;'}</td>`;
    }

    #onMenu(e) {

    }

    #onClick(e) {
        const me = this;
        const el = e.target;
        const isAppend = e.shiftKey & me.multiselect;

        if (!el.tagName === 'TD') return;
        if (!me.select) return;

        requestAnimationFrame(() => {
            me.#onRowSelect(el.closest('tr'), isAppend);
        });

    }

    #onRowSelect(row, append = false) {

        const me = this;
        const isSelected = GSUtil.getAttributeAsBool(row, 'selected');

        if (!append) GSUtil.findAll('tr', me, true)
            .forEach(el => {
                GSUtil.setAttribute(el, 'class', null);
                GSUtil.setAttribute(el, 'selected', null);
            });

        GSUtil.setAttribute(row, 'class', isSelected ? null : me.cssSelect);
        GSUtil.setAttribute(row, 'selected', isSelected ? null : true);

        const data = [];
        GSUtil.findAll('tr[selected=true]', me, true).forEach(el => data.push(el.rowIndex));
        GSUtil.sendEvent(me, 'select', data, true);
    }

}