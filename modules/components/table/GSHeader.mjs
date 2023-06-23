/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSHeader class
 * @module components/table/GSHeader
 */

import GSDOM from "../../base/GSDOM.mjs";
import GSAttr from "../../base/GSAttr.mjs";

/**
 * Table header renderer for GSTable
 * @class
 * @extends {HTMLElement}
 */
export default class GSHeader extends HTMLElement {

    static {
        customElements.define('gs-header', GSHeader);
    }

    get #columns() {
        return GSDOM.queryAll(this, 'gs-column');
    }

    get #filtered() {
        return GSDOM.queryAll(this, 'gs-column[filter=true]');
    }

    get #available() {
        return GSDOM.queryAll(this, 'gs-column').filter(el => GSAttr.get(el, 'hidden', 'false') === 'false');
    }

    render() {
        const me = this;

        const table = me.table;
        const filters = me.#filtered;
        const columns = me.#available;

        const html = [];
        html.push(`<thead class="${table.cssHeader}">`);

        if (filters.length > 0) {
            html.push(`<tr is="gs-tablefilter" class="${table.cssFilter}">`);
            me.#columns.forEach(el => html.push(el.renderFilter()));
            html.push('</tr>');
        }

        html.push(`<tr is="gs-tablesort" class="${table.cssColumns}">`);
        columns.forEach(el => html.push(el.render()));
        html.push('</tr>');

        html.push('</thead>');
        return html.join('');
    }

    toJSON() {
        const me = this;
        const cols = me.#available;
        return cols.map(el => el.toJSON());
    }

    get table() {
        return GSDOM.closest(this, 'GS-TABLE')
    }

    get fields() {
        const me = this;
        const cols = me.#available;
        return cols.map(el => GSAttr.get(el, 'name'));
    }

}


