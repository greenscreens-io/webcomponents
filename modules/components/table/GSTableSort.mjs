/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTableSort class
 * @module components/table/GSTableSort
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSEvent from "../../base/GSEvent.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";

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
        GSEvent.attach(me, me, 'click', e => me.#onClick(e));
        GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSEvent.deattachListeners(me);
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

        let ord = GSAttr.getAsNum(el, 'order', -1);
        ord = ord > 0 ? -1 : 1;

        if (append) {
            me.#sc = GSAttr.getAsNum(el, 'idx', me.#sc + 1);
            GSDOM.toggleClass(el, false, 'sorting_desc sorting_asc table-active');
        } else {
            me.#sc = 1;
            GSDOM.findAll('thead th', me, true).forEach(el => {
                GSAttr.set(el, 'idx', null);
                GSAttr.set(el, 'order', null);
                GSDOM.toggleClass(el, false, 'sorting_desc sorting_asc table-active');
            });
        }

        el.classList.add(ord > 0 ? 'sorting_asc' : 'sorting_desc');
        GSAttr.set(el, 'idx', me.#sc);
        GSAttr.set(el, 'order', ord);
        GSDOM.toggleClass(el, true, 'table-active');


        let sort = [];
        GSDOM.findAll('.sorting_asc, .sorting_desc', me, true).forEach(el => {
            const ord = GSAttr.getAsNum(el, 'order', 1);
            const idx = GSAttr.getAsNum(el, 'idx', 1);
            const name = GSAttr.get(el, 'name', el.innerText);
            const cfg = { ord: ord, col: el.cellIndex, name: name, idx: idx };
            sort.push(cfg);
        });
        sort = GSUtil.sortData([{ name: 'idx', ord: 1 }], sort);

        GSEvent.send(me, 'sort', sort, true);
    }

}
