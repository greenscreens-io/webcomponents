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

    static observedAttributes = ['value', 'locale'];

    connectedCallback() {
        this.#update();
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#update();
    }

    #update() {
        GSDOM.setHTML(this, this.format);
    }

    get result() {
        const me = this;
        if (me.format) return me.value.format(me.format);
        return new Intl.DateTimeFormat(me.locale, me.dataset).format(me.value);
    }

    get format() {
        return GSAttr.get(this, 'format');
    }

    set format(val = '') {
        return GSAttr.set(this, 'format', val);
    }

    get value() {
        const o = Date.parse(GSAttr.get(this, 'value'));
        return new GSDate(o);
    }

    set value(val = '') {
        GSAttr.set(this, 'value', val);
    }

    get locale() {
        return GSAttr.get(this, 'locale', 'default');
    }

    set locale(val = '') {
        GSAttr.set(this, 'locale', val);
    }

    static {
        customElements.define('gs-date-format', GSDateFormat);
        Object.seal(GSDateFormat);
    }
}
