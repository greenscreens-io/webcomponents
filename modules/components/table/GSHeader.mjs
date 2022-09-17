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

    /*
    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
    }
    */

    render() {
        const me = this;

        const table = me.table;
        const filters = GSDOM.queryAll(me, 'gs-column[filter=true]');
        const columns = GSDOM.queryAll(me, 'gs-column');

        const html = [];
        html.push(`<thead class="${table.cssHeader}">`);

        if (filters.length > 0) {
            html.push(`<tr is="gs-tablefilter" class="${table.cssFilter}">`);
            columns.forEach(el => html.push(el.renderFilter()));
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
        const cols = GSDOM.queryAll(me, 'gs-column');
        return cols.map(el => el.toJSON());
    }

    get table() {
        return GSDOM.closest(this, 'GS-TABLE')
    }

    get fields() {
        const me = this;
        const cols = GSDOM.queryAll(me, 'gs-column');
        return cols.map(el => GSAttr.get(el, 'name'));

    }
}


