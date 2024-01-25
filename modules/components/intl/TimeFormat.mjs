/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from '../../GSElement.mjs';
import { GSUtil } from '../../base/GSUtil.mjs';

/**
 * A module rendering current time on a page
 * @module components/TimeFormat
 */

/**
 * Render Time value
 * 
 * @class
 * @extends {HTMLElement}
 */
export class GSTimeFormat extends GSElement {

    static properties = {
        interval: {reflect:true, type:Number},
        locale: {reflect:true},
    }

    #id = 0;

    constructor() {
        super();
        this.interval = 1;
        this.locale = GSUtil.locale;
    }

    connectedCallback() {
        super.connectedCallback();
        this.start();
    }

    disconnectedCallback() {
        this.stop();
        super.disconnectedCallback();
    }

    renderUI() {
        const date = new Date();
        return date.toLocaleTimeString(this.locale);
    }    

    start() {
        const me = this;
        if (me.interval >0 && me.#id === 0) {
            me.#id = setInterval(me.#update.bind(me), me.interval * 1000);
        } else {
            me.requestUpdate();
        }
    }

    stop() {
        clearInterval(this.#id);
        this.#id = 0;
    }
    
    #update() {
       requestAnimationFrame(() => this.requestUpdate());
    }

    static {
        this.define('gs-time-format');
    }
}
