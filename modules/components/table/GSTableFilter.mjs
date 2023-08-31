/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTableFilter class
 * @module components/table/GSTableFilter
 */

import GSID from "../../base/GSID.mjs";
import GSEvents from "../../base/GSEvents.mjs";
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
        GSID.setIf(me);
        me.#auto = GSDOM.query(me, 'input[auto="true"],select[auto="true"]') != null;
        me.#attachChangeListener();
        me.#attachDataListener();
        GSComponents.store(me);
        requestAnimationFrame(() => me.#onChange());
    }

    /*
     * Called when element removed from parent DOM node
     */
    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSEvents.deattachListeners(me);
    }

    get root() {
        return GSDOM.root(this);
    }

    get filters() {
        const me = this;
        const filter = [];
        GSDOM.queryAll(me, 'input, select').forEach(el => {
            const value = me.#getValue(el);
            if (value) filter.push({ name: el.name, value: value });
        });
        return filter; 
    }

    #attachChangeListener() {
        const me = this;
        GSDOM.queryAll(me, 'input, select')
            .forEach(el => GSEvents.attach(me, el, 'change', e => me.#onChange(e)));
    }

    #attachDataListener() {
        const me = this;
        if (me.#auto) GSEvents.attach(me, me.root, 'data', e => me.#onData(e.detail), false, true);
    }

    #onChange(e) {
        const me = this;
        const obj = {
            data : me.filters,
            initial : e ? false : true
        };
        GSEvents.send(me, 'filter', obj, true, true, true);
    }

    #onData(data) {

    }

    #getValue(el) {
        const me = this;
        const listID = GSAttr.get(el, 'list');
        if (!listID) return GSDOM.getValue(el);
        const list = me.root.getElementById(listID);
        const opt = list?.querySelector(`option[value="${el.value}"]`);
        return opt?.dataset?.value || el.value;
    }

}

