/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSPagination class
 * @module components/table/GSPagination
 */

import GSElement from "../../base/GSElement.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSComponents from "../../base/GSComponents.mjs";

/**
 * Table pagination
 * @class
 * @extends {GSElement}
 */
export default class GSPagination extends GSElement {

    static CSS_ITEM = 'me-1';

    static {
        customElements.define('gs-pager', GSPagination);
        Object.seal(GSPagination);
    }

    constructor() {
        super();
    }

    async getTemplate(val = '') {
        const me = this;

        const store = me.store;
        const firstlast = me.firstlast;
        const nextprev = me.nextprev;
        const pages = this.pages;

        const html = [];
        html.push('<nav><ul class="pagination justify-content-center user-select-none m-3">');

        if (firstlast) html.push(me.#getHtml(me.first, 'first', 'First page'));
        if (nextprev) html.push(me.#getHtml(me.previous, 'previous', 'Previous page'));

        let i = 1;
        while (i <= pages) {
            html.push(me.#getHtml(i, '', '', i == store.page));
            i++;
        }

        if (nextprev) html.push(me.#getHtml(me.next, 'next', 'Next page'));
        if (firstlast) html.push(me.#getHtml(me.last, 'last', 'Last page'));

        html.push('</ul></nav>');
        return html.join('');
    }

    #getHtml(text = '', name = '', title = '', active = false) {
        return `<li class="page-item ${GSPagination.CSS_ITEM} ${active ? 'active' : ''}"><a class="page-link" name="${name}" title="${title}" href="#" >${text}</a></li>`;
    }

    #onStore(e) {
        const me = this;
        requestAnimationFrame(() => {
            let page = me.pages === 0 ? 0 : (Math.floor((me.store.page - 1) / me.pages) * me.pages + 1);
            me.queryAll('a[name=""]').forEach(el => {
                el.parentElement.classList.remove('active', 'disabled', 'd-none');
                if (page == me.store.page) el.parentElement.classList.add('active');
                if (page > me.store.pages) el.parentElement.classList.add('disabled', 'd-none');
                el.text = page++;
            });
        });
    }

    #onClick(e) {
        const me = this;
        const val = e.target.name || e.target.text;
        switch (val) {
            case 'first':
                return me.store.firstPage();
            case 'last':
                return me.store.lastPage();
            case 'next':
                return me.store.nextPage();
            case 'previous':
                return me.store.prevPage();
        }

        me.store.page = val || me.store.page;
    }

    onReady() {
        super.onReady();
        const me = this;
        me.attachEvent(me.store, 'data', me.#onStore.bind(me));
        me.queryAll('a').forEach(el => me.attachEvent(el, 'click', me.#onClick.bind(me)));
    }

    get table() {
        return GSDOM.closest(this, 'GS-TABLE');
    }

    /**
     * Either define store atrtibute with store id
     * Or use automatic search for closest table.
     * This allows to put pagination on non-default position
     */
    get store() {
        const me = this;
        const tgt = GSAttr.get(me, 'store');
        return tgt ? GSComponents.get(tgt) : me.table.store;
    }

    get nextprev() {
        return GSAttr.getAsBool(this, 'nextprev', true);
    }

    get firstlast() {
        return GSAttr.getAsBool(this, 'firstlast', true);
    }

    get pages() {
        return GSAttr.getAsNum(this, 'pages', 5);
    }

    get first() {
        return GSAttr.get(this, 'first', '&laquo;');
    }

    get last() {
        return GSAttr.get(this, 'last', '&raquo;');
    }

    get next() {
        return GSAttr.get(this, 'next', '&rsaquo;');
    }

    get previous() {
        return GSAttr.get(this, 'previous', '&lsaquo;');
    }
}

