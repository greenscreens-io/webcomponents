/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSHeader class
 * @module components/table/GSHeader
 */

// import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSComponents from "../../base/GSComponents.mjs";

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
        const filters = GSUtil.findAll('gs-column[filter=true]', me, true);
        const columns = GSUtil.findAll('gs-column', me, true);

        const html = [];
        html.push(`<thead class="${table.cssHeader}">`);

        if (filters.length > 0) {
            html.push('<tr is="gs-tablefilter">');
            columns.forEach(el => html.push(el.renderFilter()));
            html.push('</tr>');
        }

        html.push('<tr is="gs-tablesort">');
        columns.forEach(el => html.push(el.render()));
        html.push('</tr>');

        html.push('</thead>');
        return html.join('');
    }

    toJSON() {
        const me = this;
        const heads = [];
        const cols = GSUtil.findAll('gs-column', me, true);
        cols.forEach((el, i) => {
            heads.push(el.toJSON());
        });
        return heads;
    }

    get table() {
        return GSComponents.getOwner(this, 'GS-TABLE')
    }
}

