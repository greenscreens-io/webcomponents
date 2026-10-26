/*
 * Copyright (C) 2015, 2027 Green Screens Ltd.
 */

import GSUtil from "../../base/GSUtil.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";

/**
 * A module rendering current time on a page
 * @module components/GSTimeFormat
 */

/**
 * Render Time value
 * 
 * @class
 * @extends {HTMLElement}
 */
export default class GSTimeFormat extends GSElement {

    #id = 0;
    #formatter;
    #formatterLocale = '';

    static get observedAttributes() {
        return ['interval', 'locale'];
    }

    attributeCallback(name = '', oldVal = '', newVal = '') {
        super.attributeCallback(name, oldVal, newVal);
        if (!this.isConnected) return;
        if (name === 'interval') {
            this.stop();
            this.start();
        }
        this.#update();
    }

    onReady() {
        super.onReady();
        const me = this;
        me.#update();
        me.start();
    }

    disconnectedCallback() {
        this.stop();
        super.disconnectedCallback();
    }

    #update() {
        const me = this;
        const date = new Date();
        if (me.#formatterLocale !== me.locale) {
            me.#formatter = new Intl.DateTimeFormat(me.locale, {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });
            me.#formatterLocale = me.locale;
        }
        const src = me.#formatter.format(date);
        GSDOM.setHTML(me.self, src);
        me.emit('time', { date }, true, true);
    }

    start() {
        const me = this;
        me.stop();
        if (me.isConnected && me.interval > 0) {
            me.#id = setInterval(me.#update.bind(me), me.interval * 1000);
        }
    }

    stop() {
        clearInterval(this.#id);
        this.#id = 0;
    }

    get isFlat() {
        return true;
    }

    get interval() {
        return GSAttr.getAsNum(this, 'interval', 1);
    }

    set interval(val = 60) {
        return GSAttr.setAsNum(this, 'interval', val);
    }

    get locale() {
        return GSAttr.get(this, 'locale', GSUtil.locale);
    }

    set locale(val = '') {
        return GSAttr.set(this, 'locale', val);
    }

    static {
        customElements.define('gs-time-format', GSTimeFormat);
        Object.seal(GSTimeFormat);
    }
}
