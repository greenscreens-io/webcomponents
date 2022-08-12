/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTableSort class
 * @module components/table/GSTableSort
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSListeners from "../../base/GSListeners.mjs";

/**
 * table header sorting coluns
 * <thead><tr is="gs-tablesort"></tr></thead>
 * @class
 * @extends {HTMLTableRowElement}
 */
export default class GSTableSort extends HTMLTableRowElement {

    #sc = 0;

    static {
        customElements.define('gs-tablesort', GSTableSort, { extends: 'tr' });
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSListeners.attachEvent(me, me, 'click', e => me.#onClick(e));
        GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSListeners.deattachListeners(me);
    }

    #onClick(e) {
        const me = this;
        const el = e.path[0];
        if (el.tagName !== 'TH') return;
        if (!el.classList.contains('sorting')) return;
        requestAnimationFrame(() => me.#onColumnSort(el, e.shiftKey));
    }

    #onColumnSort(el, append = false) {

        const me = this;

        let ord = GSUtil.getAttributeAsNum(el, 'order', -1);
        ord = ord > 0 ? -1 : 1;

        if (append) {
            me.#sc = GSUtil.getAttributeAsNum(el, 'idx', me.#sc + 1);
            GSUtil.toggleClass(el, false, 'sorting_desc sorting_asc table-active');
        } else {
            me.#sc = 1;
            GSUtil.findAll('thead th', me, true).forEach(el => {
                GSUtil.setAttribute(el, 'idx', null);
                GSUtil.setAttribute(el, 'order', null);
                GSUtil.toggleClass(el, false, 'sorting_desc sorting_asc table-active');
            });
        }

        el.classList.add(ord > 0 ? 'sorting_asc' : 'sorting_desc');
        GSUtil.setAttribute(el, 'idx', me.#sc);
        GSUtil.setAttribute(el, 'order', ord);
        GSUtil.toggleClass(el, true, 'table-active');


        let sort = [];
        GSUtil.findAll('.sorting_asc, .sorting_desc', me, true).forEach(el => {
            const ord = GSUtil.getAttributeAsNum(el, 'order', 1);
            const idx = GSUtil.getAttributeAsNum(el, 'idx', 1);
            const name = GSUtil.getAttribute(el, 'name', el.innerText);
            const cfg = { ord: ord, col: el.cellIndex, name: name, idx: idx };
            sort.push(cfg);
        });
        sort = GSUtil.sortData([{ name: 'idx', ord: 1 }], sort);

        GSUtil.sendEvent(me, 'sort', sort, true);
    }

}
