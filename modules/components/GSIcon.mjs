/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSButton class
 * @module components/GSButton
 */

import GSElement from "../base/GSElement.mjs";
import GSAttr from "../base/GSAttr.mjs";

/**
 * 
 * <gs-icon icon="database" hover="gs-fade" size="3"></gs-button>
 * @class
 * @extends {GSElement}
 */
export default class GSIcon extends GSElement {

    static {
        customElements.define('gs-icon', GSIcon);
        Object.seal(GSIcon);
    }

    static get observedAttributes() {
        //const attrs = ['icon', 'size', 'css'];
        return GSElement.observeAttributes([]);
    }

    constructor() {
        super();
    } 

    onReady() {
        super.onReady();
        const me = this;
        if (me.hover) {
            me.attachEvent(me.self, 'mouseover', me.#onMouseOver.bind(me));
            me.attachEvent(me.self, 'mouseout', me.#onMouseOut.bind(me));
        }
    }

    #onMouseOver(e) {
        GSDOM.toggleClass(this.self, this.hover, true);
    }

    #onMouseOut(e) {
        GSDOM.toggleClass(this.self, this.hover, false);
    }

    get template() {
        const me = this;
        return `<i class="bi bi-${me.icon} ${me.#sizeCss} ${me.css}"></i>`;
    }

    get #sizeCss() {
        return this.size>0 ? `fs fs-${this.size}` : '';
    }

    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get icon() {
        return GSAttr.get(this, 'icon');
    }

    set icon(val = '') {
        return GSAttr.set(this, 'icon', val);
    }

    get size() {
        return GSAttr.getAsNum(this, 'size');
    }

    set size(val = 0) {
        return GSAttr.setAsNum(this, 'size', val);
    }

    /**
     * Animation css when mouse over
     */
    get hover() {
        return GSAttr.get(this, 'hover');
    }

    set hover(val = '') {
        return GSAttr.set(this, 'hover', val);
    }

    /**
     * Prevent shadow dom
     */
    get isFlat() {
        return true;
    }

    get anchor() {
        return 'self';
    }

}

