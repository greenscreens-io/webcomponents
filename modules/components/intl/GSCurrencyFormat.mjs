/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options


/**
 * A module rendering numeric value as curency format with specific langauge support
 * @module components/GSCurrencyFormat
 */
import GSAttr from '../../base/GSAttr.mjs'
import GSDOM from '../../base/GSDOM.mjs';

/**
 * Render Year value
 * 
 * @class
 * @extends {HTMLElement}
 */
export default class GSCurrencyFormat extends HTMLElement {

    static observedAttributes = ['value', 'locale', 'currency'];
    
    #id = 0;

    connectedCallback() {
        this.#update();
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#update();
    }

    #update() {
        const me = this;
        if (me.#id > 0) return;
        me.#id = setTimeout(() => {
            GSDOM.setHTML(me, me.format);
            me.#id = 0;
        }, 50);
    }

    get #options() {
        const me = this;
        return Object.apply(me.dataset, { style: 'currency', currency: me.currency});
    }

    get format() {
        const me = this;
        return new Intl.NumberFormat(me.locale, me.#options).format(me.value);
    }

    get value() {
        return GSAttr.getAsNum(this, 'value', 0);
    }

    set value(val = '') {
        GSAttr.setAsNum(this, 'value', val);
    }

    get locale() {
        return GSAttr.get(this, 'locale', navigator.language);
    }

    set locale(val = '') {
        GSAttr.set(this, 'locale', val);
    }

    get currency() {
        return GSAttr.get(this, 'currency', '');
    }

    set currency(val = '') {
        GSAttr.set(this, 'currency', val);
    }

    static {
        customElements.define('gs-currency-format', GSCurrencyFormat);
        Object.seal(GSCurrencyFormat);
    }    
}
