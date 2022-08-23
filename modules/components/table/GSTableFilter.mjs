/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTableFilter class
 * @module components/table/GSTableFilter
 */

import GSID from "../../base/GSID.mjs";
import GSEvent from "../../base/GSEvent.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";

/**
 * Table header filter with filtering input fields foer every column
 * <thead><tr is="gs-tablefilter"></tr></thead>
 * @class
 * @extends {HTMLTableRowElement}
 */
export default class GSTableFilter extends HTMLTableRowElement {

    #auto = false;

    static {
        customElements.define('gs-tablefilter', GSTableFilter, { extends: 'tr' });
        Object.seal(GSTableFilter);
    }

    /*
     * Called when element injected to parent DOM node
     */
    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        me.#auto = GSDOM.findEl('input[auto="true"],select[auto="true"]') != null;
        me.#attachChangeListener();
        me.#attachDataListener();
        GSComponents.store(me);
    }

    /*
     * Called when element removed from parent DOM node
     */
    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSEvent.deattachListeners(me);
    }

    get root() {
        return GSDOM.getRoot(this);
    }

    #attachChangeListener() {
        const me = this;
        GSDOM.findAll('input, select', me, true).forEach(el => GSEvent.attach(me, el, 'change', e => me.#onChange(e.target)));
    }

    #attachDataListener() {
        const me = this;
        if (!me.#auto) return;
        GSEvent.attach(me, me.root, 'data', e => me.#onData(e.detail), false, true);
    }

    #onChange(el) {
        const me = this;
        const filter = [];
        GSDOM.findAll('input, select', me, true).forEach(el => {
            const value = me.#getValue(el);
            if (value) filter.push({ name: el.name, value: value });
        });
        GSEvent.send(me, 'filter', filter, true);
    }

    #onData(data) {

    }

    #getValue(el) {
        const me = this;
        const listID = GSAttr.get(el, 'list');
        const list = me.root.getElementById(listID);
        if (!list) return el.value;
        const opt = list.querySelector(`option[value="${el.value}"]`);
        if (!opt) return el.value;
        return GSAttr.get(opt, 'data-value', el.value);
    }

}
