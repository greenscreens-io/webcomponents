/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAccordion class
 * @module components/table/GSColumn
 */

import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSID from "../../base/GSID.mjs";
import GSItem from "../../base/GSItem.mjs";

/**
 * Table column renderer for GSTable
 * @class
 * @extends {HTMLElement}
 */
export default class GSColumn extends HTMLElement {

    static {
        customElements.define('gs-column', GSColumn);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    render() {
        const me = this;

        const clssort = me.sortable ? 'sorting' : '';
        const style = me.width ? `style="width:${me.width};"` : '';
        return `<th scope="col" name="${me.name}" class="${clssort}" ${style}>${me.title || me.name}</th>`;
    }

    renderFilter() {
        const me = this;
        if (!me.filter) return '<th></th>';
        let html = '';
        switch (me.list) {
            case 'fixed':
                html = me.#renderFixed();
                break;
            case 'flexi':
                html = me.#renderFlexi();
                break;
            default:
                html = me.#renderField();
        }
        return `<th>${html}</th>`;
    }

    #renderFixed() {
        const me = this;
        const opts = me.#renderOptions(true);
        return `<select auto="${me.auto}" name="${me.name}" title="${me.title || me.name}" class="${me.cssFilter}" >${opts}</select>`;
    }

    #renderFlexi() {
        const me = this;
        const id = GSID.next();
        const html = me.#renderField(id);
        const opts = me.#renderOptions(false);
        const list = `<datalist id="${id}">${opts}</datalist>`;
        return html + list;
    }

    #renderField(list = '') {
        const me = this;
        return `<input auto="${me.auto}" name="${me.name}" title="${me.title || me.name}" class="${me.cssFilter}" list="${list}">`;
    }

    #renderOptions(isCombo = false) {
        const me = this;
        const list = [];
        me.items.forEach(el => {
            const def = GSAttr.getAsBool(el, 'default', false);
            const value = GSAttr.get(el, 'value', '');
            const title = GSAttr.get(el, 'title', value);
            let html = '';
            if (isCombo) {
                html = `<option value="${value}" ${def ? 'selected' : ''}>${title}</option>`;
            } else {
                html = `<option value="${title}" data-value="${value}">`;
            }
            list.push(html);
        });
        return list.join('');
    }

    get table() {
        return GSDOM.closest(this, 'GS-TABLE');
    }

    get cssFilter() {
        return GSAttr.get(this, 'css-filter', 'form-control');
    }

    get filter() {
        return GSAttr.getAsBool(this, 'filter', false);
    }

    get sortable() {
        const me = this;
        return me.name && !me.counter ? GSAttr.getAsBool(me, 'sortable', true) : false;
    }

    get width() {
        return GSAttr.get(this, 'width');
    }

    get name() {
        return GSAttr.get(this, 'name', '');
    }

    get title() {
        return GSAttr.get(this, 'title', '');
    }

    get counter() {
        return this.name === '#';
    }

    get index() {
        return GSAttr.getAsNum(this, 'index', -1);
    }

    /**
     * Will generate ComboBox or datalist
     */
    get list() {
        const me = this;
        const val = GSAttr.get(me, 'list', '').toLowerCase();
        const isValid = ['fixed', 'flexi'].indexOf(val) > -1;
        if (!isValid && !me.auto) return 'flexi';
        return isValid ? val : '';
    }

    get items() {
        return GSItem.genericItems(this);
    }

    /**
     * Is auto populate list with data values
     */
    get auto() {
        return this.childElementCount === 0;
    }

    toJSON() {
        const me = this;
        //const idx = [...me.parentElement.children].indexOf(me);
        return { name: me.name, title: me.title, width: me.width, sortable: me.sortable, idx: me.index };
    }
}

