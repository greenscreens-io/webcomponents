/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module rendering current year on a page
 * @module components/GSYearFormat
 */
import GSAttr from '../../base/GSAttr.mjs'
import GSDOM from '../../base/GSDOM.mjs'

/**
 * Render Year value
 * 
 * @class
 * @extends {HTMLElement}
 */
export default class GSYearFormat extends HTMLElement {

    static observedAttributes = ['offset'];

    connectedCallback() {
        this.#update();
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#update();
    }

    #update() {
        GSDOM.setHTML(this, this.value);
    }

    get value() {
        return this.current + this.offset;
    }

    get current() {
        return new Date().getFullYear();
    }

    get offset() {
        return GSAttr.getAsNum(this, 'offset', 0);
    }

    set offset(val = '0') {
        GSAttr.setAsNum(this, 'offset', val);
    }

    static {
        customElements.define('gs-year-format', GSYearFormat);
        Object.seal(GSYearFormat);
    }    
}
