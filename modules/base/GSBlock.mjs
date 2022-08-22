/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSBlock class
 * @module base/GSBlock
 */

import GSAttr from "./GSAttr.mjs";
import GSID from "./GSID.mjs";

/**
 * Contaner for flat rendering (without Shadow DOM)
 * @class
 * @extends HTMLElement
 */
export default class GSBlock extends HTMLElement {

    #parent = null;

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        me.#parent = me.parentElement;
    }

    disconnectedCallback() {
        const me = this;
        if (me.#parent && me.ref) {
            const ref = `#${me.ref}`;
            let el = me.#parent.querySelector(ref);
            if (!el) el = GSComponents.query(ref);
            if (el) el.remove();
        }
        me.#parent = null;
    }

    /**
     * Return an ID of GSComponent class that owns this element
     * @returns {string} An ID of GSComponent class
     */
    get ref() {
        return GSAttr.get(this, 'ref');
    }

    static {
        customElements.define('gs-block', GSBlock);
    }

}
