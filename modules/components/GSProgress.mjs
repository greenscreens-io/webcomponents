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
import GSCacheStyles from "../head/GSCacheStyles.mjs";

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
        const attrs = ['min', 'max', 'value'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const bar = me.#bar;
        if (!bar) return;
        GSAttr.set(bar, `data-${name}`, newValue);
        me.#updatePercentage();
    }

    disconnectedCallback() {
        GSCacheStyles.removeRule(this.#barRule);
        super.disconnectedCallback();
    }
    
    #updatePercentage() {
        const me = this;
        const bar = me.#bar;
        const rule = GSCacheStyles.getRule(me.#barRule);
        if (rule) rule.style.width = `${me.percentage}%`;
        //if (bar) bar.style.width = `${me.percentage}%`;        
        if (me.label && bar) GSDOM.setHTML(bar, me.#fromLabel());
    }

    #fromLabel() {
        const me = this;
        const opt = { value: me.value, min: me.min, max: me.max, percentage: me.percentage };
        return GSUtil.fromTemplateLiteral(me.label, opt);
    }

    get #barRule() {
        return `${this.styleID}-bar`;
    }

    async getTemplate(val = '') {
        const me = this;
        const label = me.label ? GSUtil.fromTemplateLiteral(me.label, { value: me.value, min: me.min, max: me.max, percentage: me.percentage }) : '';
		GSCacheStyles.addRule(`${me.#barRule}`, `width:${me.percentage}%`);
        return `
        <div class="progress ${this.styleID}"  data-css-id="${this.styleID}">
            <div class="progress-bar ${me.css} ${me.#barRule}" data-rule-id="${this.#barRule}" role="progressbar" data-value="${me.value}" data-min="${me.min}" data-max="${me.max}">${label}</div>
        </div>    
        `;
    }

    onReady() {
        super.onReady();
        this.#updatePercentage();
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
        return GSAttr.getAsNum(this, 'value', 0);
    }

    set value(val = '') {
        if (!GSUtil.isNumber(val)) return false;
        const me = this;
        let v = GSUtil.asNum(val); // || me.value;
        if (v > me.max) v = me.max;
        if (v < me.min) v = me.min;
        return GSAttr.setAsNum(me, 'value', v);
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

