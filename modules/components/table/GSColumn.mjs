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
import GSLoader from "../../base/GSLoader.mjs";

/**
 * Table column renderer for GSTable
 * @class
 * @extends {HTMLElement}
 */
export default class GSColumn extends HTMLElement {

    static {
        customElements.define('gs-column', GSColumn);
    }

    #map = [];

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    connectedCallback() {
        this.#loadMap();
    }

    async #loadMap() {
        const me = this;
        const data = await GSLoader.loadSafe(me.src, 'GET', null, true);
        me.#map = Array.isArray(data) ? data : Object.entries(data);
    }

    render() {
        const me = this;

        const clssort = me.sortable ? 'sorting' : '';
        const style = me.width ? `style="width:${me.width};"` : '';
        const cspan = me.colspan ? `colspan="${me.colspan}"` : '';

        return `<th tabindex="0" scope="col" data-sortable="${me.sortable}" data-order="${me.#orderID}" name="${me.name}" ${cspan} class="${clssort} ${me.cssHeader}" ${style}>${me.title || me.name}</th>`;
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
        return `<th css="${me.cssFilter}">${html}</th>`;
    }

    #renderFixed() {
        const me = this;
        const opts = me.#renderOptions(true);
        return `<select auto="${me.auto}" name="${me.name}" title="${me.title || me.name}" class="${me.cssField}" >${opts}</select>`;
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
        return `<input auto="${me.auto}" name="${me.name}" title="${me.title || me.name}" class="${me.cssField}" placeholder="${me.title || me.name}" list="${list}">`;
    }

    #renderOptions(isCombo = false) {
        const me = this;
        const list = [];
        me.filters.forEach(el => {
            const def = GSAttr.getAsBool(el, 'default', false);
            const value = GSAttr.get(el, 'value', '');
            const title = GSAttr.get(el, 'map', value);
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

    get #orderID() {
        const me = this;
        if(me.sortable && me.direction) return me.direction === 'asc' ? 1 : -1;
        return 0;
    }

    get table() {
        return GSDOM.closest(this, 'GS-TABLE');
    }

    get cssField() {
        const me = this;
        const def = me.list ? 'form-select' : 'form-control';
        return GSAttr.get(me, 'css-field', def);
    }

    get filter() {
        return GSAttr.getAsBool(this, 'filter', false);
    }

    get sortable() {
        const me = this;
        return me.name && !me.counter ? GSAttr.getAsBool(me, 'sortable', true) : false;
    }

    get direction() {
        const me = this;
        return GSAttr.get(me, 'direction', '');
    }

    get cssFilter() {
        return GSAttr.get(this, 'css-filter', '');
    }

    get cssHeader() {
        return GSAttr.get(this, 'css-header', 'border-end');
    }

    get css() {
        return GSAttr.get(this, 'css', '');
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

    get format() {
        return GSAttr.get(this, 'format');
    }

    get type() {
        return GSAttr.get(this, 'type');
    }

    get colspan() {
        return GSAttr.get(this, 'colspan', '');
    }

    /**
     * Will generate ComboBox or datalist
     */
    get list() {
        const me = this;
        const val = GSAttr.get(me, 'list', '').toLowerCase();
        const isValid = ['fixed', 'flexi'].includes(val);
        if (!isValid && !me.auto) return 'flexi';
        return isValid ? val : '';
    }

    get items() {
        return GSItem.genericItems(this);
    }

    get filterDef() {
        return this.querySelector('gs-item[filter="true"]');
    }

    get mapDef() {
        return this.querySelector('gs-item[map="true"]');
    }

    get ref() {
        return GSAttr.get(this.mapDef, 'ref');
    }

    get src() {
        return GSAttr.get(this.mapDef, 'src');
    }

    get filters() {
        return GSItem.genericItems(this.filterDef);
    }

    get maps() {
        return GSItem.genericItems(this.mapDef);
    }

    /**
     * Is auto populate list with data values
     */
    get auto() {
        return this.childElementCount === 0;
    }

    get #mapping() {
        const me = this;
        if (me.src) return me.#map;
        if (me.#map.length === 0) me.#map =  me.maps.map(el => [GSAttr.get(el, 'value'), GSAttr.get(el, 'map')]);
        return me.#map;
    }

    toJSON() {
        const me = this;
        // [[val,map]]
        return {
            ref : me.ref,
            name: me.name,
            title: me.title,
            width: me.width,
            sortable: me.sortable,
            filter: me.filter,
            idx: me.index,
            type: me.type,
            format: me.format,
            css: me.css,
            colspan: me.colspan,
            map: me.#mapping
        };
    }
}


