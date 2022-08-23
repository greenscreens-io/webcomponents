/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSEvent from "../base/GSEvent.mjs";
import GSAttr from "../base/GSAttr.mjs";

/**
 * A module rendering current time on a page
 * @module components/GSTime
 */

/**
 * Render Time value
 * 
 * @class
 * @extends {HTMLElement}
 */
export default class GSTime extends GSElement {

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
        me.innerHTML = date.toLocaleTimeString(me.locale);
        GSEvent.send(me, 'time', { date }, true, true);
    }

    start() {
        const me = this;
        me.#id = setInterval(me.#update.bind(me), me.interval * 1000);
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

    set locale(val = 60) {
        return GSAttr.set(this, 'locale', val);
    }

    static {
        customElements.define('gs-time', GSTime);
    }
}