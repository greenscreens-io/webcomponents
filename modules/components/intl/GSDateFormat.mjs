/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module rendering date with specific langauge support
 * @module components/GSDateFormat
 */
import GSAttr from '../../base/GSAttr.mjs'
import GSDate from '../../base/GSDate.mjs';
import GSDOM from '../../base/GSDOM.mjs';

/**
 * Render Date value with international language support
 * 
 * All options - set dasta-[name]; data-weekday etc...
       {
       weekday: 'narrow' | 'short' | 'long',
       era: 'narrow' | 'short' | 'long',
       year: 'numeric' | '2-digit',
       month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
       day: 'numeric' | '2-digit',
       hour: 'numeric' | '2-digit',
       minute: 'numeric' | '2-digit',
       second: 'numeric' | '2-digit',
       timeZoneName: 'short' | 'long',

       // Time zone to express it in
       timeZone: 'Asia/Shanghai',
       // Force 12-hour or 24-hour
       hour12: true | false,

       dateStyle: full | long | medium | short
       timeStyle: full | long | medium | short

       // Rarely-used options
       hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
       formatMatcher: 'basic' | 'best fit'
       }
 * @class
 * @extends {HTMLElement}
 */
export default class GSDateFormat extends HTMLElement {

    static observedAttributes = ['value', 'locale', 'format'];

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
            GSDOM.setHTML(me, me.result);
            me.#id = 0;
        }, 50);
    }

    get result() {
        const me = this;
        const val = me.value;
        if (me.format) return val.format(me.format);
        return new Intl.DateTimeFormat(me.locale, me.dataset).format(val);
    }

    get format() {
        return GSAttr.get(this, 'format');
    }

    set format(val = '') {
        return GSAttr.set(this, 'format', val);
    }

    get value() {
        const me = this;
        const o = Date.parse(GSAttr.get(me, 'value'));
        return new GSDate(o, me.locale);
    }

    set value(val = '') {
        GSAttr.set(this, 'value', val);
    }

    get locale() {
        return GSAttr.get(this, 'locale', navigator.locale);
    }

    set locale(val = '') {
        GSAttr.set(this, 'locale', val);
    }

    static {
        customElements.define('gs-date-format', GSDateFormat);
        Object.seal(GSDateFormat);
    }
}
