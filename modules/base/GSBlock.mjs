/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSBlock class
 * @module base/GSBlock
 */

import GSAttr from "./GSAttr.mjs";
import GSDOM from "./GSDOM.mjs";
import GSID from "./GSID.mjs";

/**
 * Contaner for flat rendering (without Shadow DOM)
 * Do not use it directly. Used internaly when GSElement marked as flat.
 * @class
 * @extends HTMLElement
 */
export default class GSBlock extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
    }

    disconnectedCallback() {
        this.owner?.remove();
    }

    /**
     * Return an ID of GSComponent class that owns this element
     * @returns {string} An ID of GSComponent class
     */
    get proxy() {
        return GSAttr.get(this, 'proxy');
    }

    get owner() {
        return GSDOM.query(document.documentElement, this.proxy);
    }

    static {
        customElements.define('gs-block', GSBlock);
        Object.seal(GSBlock);
    }

}

