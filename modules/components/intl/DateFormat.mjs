/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module rendering date with specific langauge support
 * @module components/DateFormat
 */

import { GSElement } from '../../GSElement.mjs';
import { GSDate } from '../../base/GSDate.mjs';

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
export class GSDateFormat extends GSElement {

    static properties = {
        value: {},
        locale: {},
        format: {},
    }

    constructor() {
        super();
        this.locale = navigator.locale;
        this.value = new Date();
    }

    renderUI() {
        return this.result;
    }    

    get result() {
        const me = this;
        const val = me.date;
        if (me.format) return val.format(me.format);
        return new Intl.DateTimeFormat(me.locale, me.dataset).format(val);
    }

    get date() {
        const me = this;
        const o = Date.parse(me.value || new Date());
        const date = new GSDate(o);
        date.locale = me.locale;
        return date;
    }


    static {
        this.define('gs-date-format');
    }
}
