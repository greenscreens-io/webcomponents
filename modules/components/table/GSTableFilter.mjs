/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTableFilter class
 * @module components/table/GSTableFilter
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSListeners from "../../base/GSListeners.mjs";

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
    }

    /*
     * Called when element injected to parent DOM node
     */
    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        me.#auto = GSUtil.findEl('input[auto="true"],select[auto="true"]') != null;
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
        GSListeners.deattachListeners(me);
    }

    get root() {
        return GSUtil.getRoot(this);
    }

    #attachChangeListener() {
        const me = this;
        GSUtil.findAll('input, select', me, true).forEach(el => {
            GSListeners.attachEvent(me, el, 'change', e => me.#onChange(e.target));
        });
    }

    #attachDataListener() {
        const me = this;
        if (!me.#auto) return;
        GSListeners.attachEvent(me, me.root, 'data', e => me.#onData(e.detail), false, true);
    }

    #onChange(el) {
        const me = this;
        const filter = [];
        GSUtil.findAll('input, select', me, true).forEach(el => {
            const value = me.#getValue(el);
            if (value) filter.push({ name: el.name, value: value });
        });
        GSUtil.sendEvent(me, 'filter', filter, true);
    }

    #onData(data) {

    }

    #getValue(el) {
        const me = this;
        const listID = GSUtil.getAttribute(el, 'list');
        const list = me.root.getElementById(listID);
        if (!list) return el.value;
        const opt = list.querySelector(`option[value="${el.value}"]`);
        if (!opt) return el.value;
        return GSUtil.getAttribute(opt, 'data-value', el.value);
    }

}
