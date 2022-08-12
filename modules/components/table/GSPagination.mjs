/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSPagination class
 * @module components/table/GSPagination
 */

import GSElement from "../../base/GSElement.mjs";
import GSUtil from "../../base/GSUtil.mjs";
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
        html.push('<nav><ul class="pagination justify-content-center m-3">');

        if (firstlast) html.push(me.#getHtml(me.first, 'first'));
        if (nextprev) html.push(me.#getHtml(me.previous, 'previous'));

        let i = 1;
        while (i <= pages) {
            html.push(me.#getHtml(i, '', i == store.page));
            i++;
        }

        if (nextprev) html.push(me.#getHtml(me.next, 'next'));
        if (firstlast) html.push(me.#getHtml(me.last, 'last'));

        html.push('</ul></nav>');
        return html.join('');
    }

    #getHtml(title = '', name = '', active = false) {
        return `<li class="page-item ${GSPagination.CSS_ITEM} ${active ? 'active' : ''}"><a class="page-link" name="${name}" href="#" >${title}</a></li>`;
    }

    #onStore(e) {
        const me = this;
        requestAnimationFrame(() => {
            let page = Math.floor((me.store.page - 1) / me.pages) * me.pages + 1;
            me.findAll('a[name=""]').forEach(el => {
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
        const me = this;
        me.attachEvent(me.store, 'data', me.#onStore.bind(me));
        me.findAll('a').forEach(el => me.attachEvent(el, 'click', me.#onClick.bind(me)));
    }

    get table() {
        return GSComponents.getOwner(this, 'GS-TABLE');
    }

    get store() {
        return this.table.store;
    }

    get nextprev() {
        return GSUtil.getAttributeAsBool(this, 'nextprev', true);
    }

    get firstlast() {
        return GSUtil.getAttributeAsBool(this, 'firstlast', true);
    }

    get pages() {
        return GSUtil.getAttributeAsNum(this, 'pages', 5);
    }

    get first() {
        return GSUtil.getAttribute(this, 'first', 'First');
    }

    get last() {
        return GSUtil.getAttribute(this, 'last', 'Last');
    }

    get next() {
        return GSUtil.getAttribute(this, 'next', 'Next');
    }

    get previous() {
        return GSUtil.getAttribute(this, 'previous', 'Previous');
    }
}
