/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from "../../base/GSUtil.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSEvent from "../../base/GSEvent.mjs";
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

    static get observedAttributes() {
        return ['interval'];
    }

    attributeChanged(name = '', oldVal = '', newVal = '') {
        const me = this;
        me.stop();
        me.start();
        me.#update();
    }

    onReady() {
        super.onReady();
        const me = this;
        me.#update();
        me.start();
    }

    disconnectedCallback() {
        this.stop();
    }

    #update() {
        const me = this;
        const date = new Date();
        const src = date.toLocaleTimeString(me.locale);
        GSDOM.setHTML(me.self, src);
        GSEvent.send(me, 'time', { date }, true, true);
        return 0;
    }

    start() {
        const me = this;
        me.#id = me.interval > 0 ? setInterval(me.#update.bind(me), me.interval * 1000) : me.#update();
    }

    stop() {
        clearInterval(this.#id);
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
