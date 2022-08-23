/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTBody class
 * @module components/table/GSTBody
 */

import GSID from "../../base/GSID.mjs";
import GSEvent from "../../base/GSEvent.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";

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
        Object.seal(GSTBody);
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSEvent.attach(me, me, 'click', e => me.#onClick(e));
        GSEvent.attach(me, me, 'contextmenu', e => me.#onMenu(e), false, true);
        GSComponents.store(me);
        me.#table = GSComponents.getOwner(me);
    }

    disconnectedCallback() {
        const me = this;
        me.#table = null;
        GSComponents.remove(me);
        GSEvent.deattachListeners(me);
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
        GSDOM.findAll('tr', me, true).forEach(el => { if (el.innerText.trim().length === 0) el.remove(); });
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
        const isSelected = GSAttr.getAsBool(row, 'selected');

        if (!append) GSDOM.findAll('tr', me, true)
            .forEach(el => {
                GSAttr.set(el, 'class', null);
                GSAttr.set(el, 'selected', null);
            });

        GSAttr.set(row, 'class', isSelected ? null : me.cssSelect);
        GSAttr.set(row, 'selected', isSelected ? null : true);

        const data = [];
        GSDOM.findAll('tr[selected=true]', me, true).forEach(el => data.push(el.rowIndex));
        GSEvent.send(me, 'select', data, true);
    }

}
