/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTableSort class
 * @module components/table/GSTableSort
 */

 import GSID from "../../base/GSID.mjs";
 import GSEvents from "../../base/GSEvents.mjs";
 import GSAttr from "../../base/GSAttr.mjs";
 import GSDOM from "../../base/GSDOM.mjs";
 import GSData from "../../base/GSData.mjs";
 import GSUtil from "../../base/GSUtil.mjs";
 
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
         Object.seal(GSTableSort);
     }
 
     connectedCallback() {
         const me = this;
         GSID.setIf(me);
         GSEvents.attach(me, me, 'click', e => me.#onClick(e));
         GSComponents.store(me);
         me.onReady();
     }
 
     disconnectedCallback() {
         const me = this;
         GSComponents.remove(me);
         GSEvents.deattachListeners(me);
     }
 
     onReady() {
         const me = this;
         requestAnimationFrame(() => {
             me.#autoSortable.forEach((el, i) => me.#onColumnSort(el, i > 0));
         });
     }

     get sorters() {
        const me = this;
        let sort = [];
        me.#sorted
        .filter(el => GSUtil.asNum(el.dataset.order, 0) !== 0)
        .forEach(el => {
            const ord = GSUtil.asNum(el.dataset.order);
            const idx = GSUtil.asNum(el.dataset.idx, 1);
            const name = GSAttr.get(el, 'name', el.innerText);
            const cfg = { ord: ord, col: el.cellIndex, name: name, idx: idx };
            sort.push(cfg);
        });
        sort = GSData.sortData([{ name: 'idx', ord: 1 }], sort);        
        return sort;
     }
 
     get #autoSortable() {
         return this.#sortable.filter(el => el.dataset.order != '0');
     }
 
     get #sorted() {
         return this.#sortable.filter(el => el.dataset.idx != '0');
     }
 
     get #sortable() {
         return GSDOM.queryAll(this, 'th[data-sortable="true"]', false, false);
     }
 
     #onClick(e) {
         const me = this;
         const el = e.composedPath().shift();
         if (el.tagName !== 'TH') return;
         if (el.dataset.sortable != 'true') return;
         const ord = GSUtil.asNum(el.dataset.order);
         el.dataset.order = ord > 0 ? -1 : 1;
         requestAnimationFrame(() => me.#onColumnSort(el, e.shiftKey));
     }
 
     #onColumnSort(el, append = false) {
 
         const me = this;
 
         const ord = GSUtil.asNum(el.dataset.order, -1);
 
         if (append) {
             me.#sc = 1 + Math.max.apply(0, me.#sortable.map(el => GSUtil.asNum(el.dataset.idx, 0)));
             GSDOM.toggleClass(el, 'sorting_desc sorting_asc table-active', false);
         } else {
             me.#sc = 1;
             GSDOM.queryAll(me, 'thead th').forEach(el => {
                 el.dataset.idx = 0;
                 el.dataset.order = 0;
                 GSDOM.toggleClass(el, 'sorting_desc sorting_asc table-active', false);
             });
         }
 
         el.classList.add(ord > 0 ? 'sorting_asc' : 'sorting_desc');
         el.dataset.idx = me.#sc;
         el.dataset.order = ord;
         GSDOM.toggleClass(el, 'table-active', true);
         GSEvents.send(me, 'sort', me.sorters, true);
     }
 
 }
 
 