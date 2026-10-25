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
import GSUtil from "../../base/GSUtil.mjs";

/**
 * Bootstrap table body renderer
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
        GSID.setIf(me);
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
        const mappings = new Map(headers.map(hdr => [
            hdr,
            new Map((hdr.map || []).map(([key, value]) => [String(key), value]))
        ]));

        data.forEach((rec, idx) => {
            const rendered = Array.isArray(rec)
                ? me.#arrayToHTML(headers, rec, idx, offset)
                : me.#objToHTML(headers, rec, offset, mappings);

            if (rendered.hasContent) {
                rows.push(`<tr tabindex="0" class="${GSUtil.sanitize(me.cssRow, true)}" data-index="${idx}">`);
                rows.push(rendered.html);
                rows.push('</tr>');
            }
        });

        if (data.length === 0 && me.table.noDataText) {
            const cspan = headers
                .map(o => {
                    const span = Number.parseInt(o.colspan, 10);
                    return Number.isFinite(span) && span > 0 ? span : 1;
                })
                .reduce((a, b) => a + b, 0);
            rows.push(me.#emptyRow(cspan));
        }

        GSDOM.setHTML(me, rows.join(''));
    }

    #emptyRow(cols) {
        return `<tr data-ignore="true"><td colspan="${cols}" class="text-center fw-bold text-muted">${GSUtil.sanitize(this.table.noDataText)}</td></tr>`;
    }

    #arrayToHTML(headers, rec, idx, offset) {
        const me = this;
        const cols = [];
        let hasContent = false;
        headers.forEach(hdr => {
            const c = hdr.name === "#" ? (idx + 1 + offset).toString() : rec[hdr.idx];
            const value = c == null ? '' : String(c);
            if (value.trim()) hasContent = true;
            cols.push(`<td class="${GSUtil.sanitize(me.cssCell, true)}">${value ? GSUtil.sanitize(value) : '&nbsp;'}</td>`);
        });

        return { html: cols.join(''), hasContent };
    }

    #objToHTML(headers, rec, offset, mappings) {
        const me = this;
        const cols = [];
        let hasContent = false;
        headers.forEach((hdr, i) => {
            const value = me.#genRow(hdr, rec, i + 1 + offset, mappings.get(hdr));
            if (value.text.trim()) hasContent = true;
            cols.push(value.html);
        });
        return { html: cols.join(''), hasContent };
    }

    #genRow(hdr, rec, idx, mapping) {
        const me = this;
        let val = hdr.name === "#" ? idx : rec[hdr.name];
        let ref = hdr.ref ? rec[hdr.ref] : val;
        if (mapping?.has(String(ref))) val = mapping.get(String(ref));
        val = me.#format(hdr, val);
        const text = val == null ? '' : String(val);
        const cspan = hdr.colspan ? `colspan="${GSUtil.sanitize(hdr.colspan)}"` : '';
        return {
            html: `<td class="${GSUtil.sanitize(`${me.cssCell, true} ${hdr.css || ''}`)}" ${cspan}>${text ? GSUtil.sanitize(text) : '&nbsp;'}</td>`,
            text
        };
    }

    #format(hdr, val) {

        if (!hdr.format) return val;

        const type = this.#toType(hdr, val);
        const locale = hdr.locale || navigator.language;

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
        const cell = e.target.closest?.('td');

        if (!cell || !me.select) return;

        requestAnimationFrame(() => {
            const row = cell.closest('tr');
            if (row) me.#onRowSelect(row, e.shiftKey && me.multiselect, e);
        });

    }

    #onRowSelect(row, append = false, evt) {

        const me = this;
        if (!row) return;
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
