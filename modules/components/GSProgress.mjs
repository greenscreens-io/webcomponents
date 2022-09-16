/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSProgress class
 * @module components/GSProgress
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";

/**
 * Process Bootstrap progress component
 * <gs-progress css="" min="0" max="100" value="0"></gs-progress>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSProgress extends GSElement {

    static {
        customElements.define('gs-progress', GSProgress);
        Object.seal(GSProgress);
    }

    static get observedAttributes() {
        const attrs = ['min', 'max', 'now'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const bar = me.#bar;
        if (!bar) return;
        GSAttr.set(bar, `aria-value${name}`, newValue);
        bar.style.width = `${me.percentage}%`;
        if (me.label) GSDOM.setHTML(bar, me.#fromLabel());
    }

    #fromLabel() {
        const me = this;
        const opt = { now: me.value, min: me.min, max: me.max, percentage: me.percentage };
        return GSUtil.fromTemplateLiteral(me.label, opt);
    }

    async getTemplate(val = '') {
        const me = this;
        const label = me.label ? GSUtil.fromTemplateLiteral(me.label, { now: me.value, min: me.min, max: me.max, percentage: me.percentage }) : '';
        return `
        <div class="progress" style="${this.getStyle()}">
            <div class="progress-bar ${me.css}" role="progressbar" style="width: ${me.percentage}%" aria-valuenow="${me.value}" aria-valuemin="${me.min}" aria-valuemax="${me.max}">${label}</div>
        </div>    
        `;
    }

    get #bar() {
        return this.query('.progress-bar');
    }

    get isFlat() {
        return true;
    }

    get anchor() {
        return 'self';
    }

    get percentage() {
        const me = this;
        return Math.trunc((me.value / me.max) * 100);
    }

    get value() {
        return GSAttr.getAsNum(this, 'now', 0);
    }

    set value(val = '') {
        if (!GSUtil.isNumber(val)) return false;
        const me = this;
        let v = GSUtil.asNum(val) || me.value;
        if (v > me.max) v = me.max;
        if (v < me.min) v = me.min;
        return GSAttr.set(me, 'now', v);
    }

    get min() {
        return GSAttr.getAsNum(this, 'min', 0);
    }

    set min(val = '') {
        return GSAttr.setAsNum(this, 'min', 0);
    }

    get max() {
        return GSAttr.getAsNum(this, 'max', 100);
    }

    set max(val = '') {
        return GSAttr.setAsNum(this, 'max', 100);
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get label() {
        return GSAttr.get(this, 'label', '');
    }

    set label(val = '') {
        return GSAttr.set(this, 'label', val);
    }

    increase(val = 1) {
        const me = this;
        me.value = me.value + val;
        return true;
    }

    decrease(val = 1) {
        const me = this;
        me.value = me.value - val;
        return true;
    }
}

