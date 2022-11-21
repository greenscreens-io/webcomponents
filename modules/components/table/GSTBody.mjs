/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTBody class
 * @module components/table/GSTBody
 */

import GSID from "../../base/GSID.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSDate from "../../base/GSDate.mjs";

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
        GSEvents.attach(me, me, 'click', e => me.#onClick(e));
        GSEvents.attach(me, me, 'contextmenu', e => me.#onMenu(e), false, true);
        me.#table = GSDOM.closest(me, 'GS-TABLE');
    }

    disconnectedCallback() {
        const me = this;
        me.#table = null;
        GSEvents.deattachListeners(me);
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
        return this.#table || GSDOM.closest(this, 'GS-TABLE');
    }

    render(headers, data, offset) {

        const me = this;
        if (!Array.isArray(headers)) return;

        const rows = [];
        let html = '';

        data.forEach((rec, idx) => {
            rows.push(`<tr tabindex="0" class="${me.cssRow}" data-index=${idx}>`);

            if (Array.isArray(rec)) {
                html = me.#arrayToHTML(headers, rec, idx, offset);
            } else {
                html = me.#objToHTML(headers, rec, offset);
            }

            rows.push(html);
            rows.push('</tr>');
        });

        if (data.length === 0 && me.table.noDataText) {
            const cspan = headers.map(o => o.colspan ? parseInt(o.colspan) | 1 : 1).reduce((a, b) => a + b, 0);
            rows.push(me.#emptyRow(cspan));
        }


        GSDOM.setHTML(me, rows.join(''));
        GSDOM.queryAll(me, 'tr').forEach(el => { if (el.innerText.trim().length === 0) el.remove(); });
    }

    #emptyRow(cols) {
        return `<tr data-ignore="true"><td colspan="${cols}" class="text-center fw-bold text-muted">${this.table.noDataText}</td></tr>`;
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
        let val = hdr.name === "#" ? idx : rec[hdr.name];
        let ref = hdr.ref ? rec[hdr.ref] : val;
        const map = hdr.map?.filter(o => o[0] === '' + ref);
        val = map?.length > 0 ? map[0][1] || val : val;
        val = me.#format(hdr, val);
        const cspan = hdr.colspan ? `colspan="${hdr.colspan}"` : '';
        // todo format data 
        return `<td class="${me.cssCell} ${hdr.css}" ${cspan}>${val?.toString() || '&nbsp;'}</td>`;
    }

    #format(hdr, val) {

        if (!hdr.format) return val;

        const type = this.#toType(hdr, val);
        const locale = hdr.locale || navigator.locale;

        switch (type) {
            case 'timestamp':
            case 'date':
                const fmt = hdr.format == 'true' ? undefined : hdr.format;
                return val && val > 0 ? new GSDate(val).format(fmt, locale) : val;
            case 'string':
            case 'boolean':
            case 'number':
                break;
            case 'currency':
                const opt = { style: 'currency', currency: hdr.currency };
                return new Intl.NumberFormat(locale, opt).format(val);
        }

        return val;
    }

    #toType(hdr, val) {
        if (hdr.type) return hdr.type;
        if (val instanceof Date) return 'date';
        if (val instanceof Number) return 'number';
        if (val instanceof Boolean) return 'boolean';
        return typeof val;
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
            me.#onRowSelect(el.closest('tr'), isAppend, e);
        });

    }

    #onRowSelect(row, append = false, evt) {

        const me = this;
        const isSelected = GSAttr.getAsBool(row, 'selected');

        if (!append) GSDOM.queryAll(me, 'tr')
            .forEach(el => {
                GSAttr.set(el, 'class', null);
                GSAttr.set(el, 'selected', null);
            });

        if (row.dataset.ignore === 'true') return;

        GSAttr.set(row, 'class', isSelected ? null : me.cssSelect);
        GSAttr.set(row, 'selected', isSelected ? null : true);

        const data = [];
        GSDOM.queryAll(me, 'tr[selected=true]').forEach(el => data.push(parseInt(el.dataset.index)));
        GSEvents.send(me, 'select', { data: data, evt: evt }, true);
    }

}

