/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { classMap, createRef, ref, html, ifDefined } from '../lib.mjs';
import { color } from '../properties/index.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSAttr } from '../base/GSAttr.mjs';

export class GSAlertElement extends GSElement {

    static properties = {
        message: { reflect: true },
        color: { ...color },
        closed: { reflect: true, type: Boolean },
        closable: { reflect: true, type: Boolean },
        delay: { reflect: true, type: Number },
    }

    #ref;
    #pause = false;
    #interval = 0;
    #last = 0;
    #data;

    constructor() {
        super();
        this.delay = 1;
        this.#ref = createRef();
        this.#data = this.#proxify(this);
    }

    disconnectedCallback() {
        clearInterval(this.#interval);
        super.disconnectedCallback();
    }

    renderUI() {
        const me = this;
        return html`<div role="alert" dir="${ifDefined(me.direction)}" ${ref(me.#ref)} 
            @mouseover="${() => me.#pause = true}"
            @mouseout="${() => me.#pause = false}"
            class="alert fade ${classMap(me.renderClass())}" >
            ${me.#first}
            ${me.renderTemplate()}
            <slot></slot>
            ${me.#second}
        </div>`;
    }

    firstUpdated(changed) {
        this.#handleBillboard();
        super.firstUpdated(changed);
    }

    updated(changed) {
        if (!changed.has('opened')) return;
        this.#handleBillboard();
    }

    renderClass() {
        const me = this;
        const css = {
            ...super.renderClass(),
            'show': !me.closed,
            'alert-dismissible': me.closable,
            [`alert-${me.color}`]: me.color,

        }
        return css;
    }

    open() {
        this.notify(false);
    }

    close() {
        this.notify(true);
    }

    toggle() {
        this.notify(!this.closed);
    }

    notify(val = false) {
        const me = this;
        me.closed = val;
        if (me.closed) setTimeout(() => { me.#ref.value.classList.toggle('d-none', true) }, 250);
        super.notify();
    }

    get isBillboard() {
        return this.#data?.length > 0;
    }

    get #message() {
        return this.translate(this.message);
    }

    get #first() { return this.rtl ? this.#button : this.#message; };

    get #second() { return this.rtl ? this.#message : this.#button; };

    get #button() {
        return this.closable ? html`<button type="button" class="btn-close" aria-label="Close" @click="${this.close}"></button>` : '';
    }

    /**
     * Proxify GS-ITEM elements to easily read attributes
     */
    #proxify(root) {
        return GSItem.collect(root).map(el => GSAttr.proxify(el, {message:{}}));
    }

    #handleBillboard() {
        const me = this;
        if (me.closed) {
            clearInterval(me.#interval);
            me.#interval = 0;
        } else {
            me.#billboard();
        }        
    }

    #billboard() {
        const me = this;
        if (!me.isBillboard) return;
        const items = me.#data;
        if (me.message) {
            me.#last = -1;
        } else {
            me.message = items[0].message;
        }
        me.#interval = setInterval(() => {
            if (me.#pause) return;
            me.#last++;
            if (me.#last >= items.length ) me.#last = 0;
            me.message = items[me.#last].message;
        }, me.delay * 1000);
    }

    static {
        this.define('gs-alert');
    }

}
