/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAlert class
 * @module components/GSAlert
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSItem from "../base/GSItem.mjs";

/**
 * https://getbootstrap.com/docs/5.1/components/buttons/
 * Process Bootstrap alert definition
 * <gs-alert css="btn-primary" css-active="fade" message="focus hover" dismissable="true"></gs-alert>
 * @class
 * @extends {GSElement}
 */
export default class GSAlert extends GSElement {

    #dismissCSS = '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    #state = false;
    #pause = false;
    #interval = 0;
    #last = 0;

    static {
        customElements.define('gs-alert', GSAlert);
        Object.seal(GSAlert);
    }

    static get observedAttributes() {
        const attrs = ['css', 'message', 'active'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    disconnectedCallback() {
        clearInterval(this.#interval);
        super.disconnectedCallback();
    }

    #onClick(e) {
        const me = this;
        GSEvents.send(me, 'action', { type: 'alert', source: e }, true);
        me.dismiss();
    }

    #billboard() {
        const me = this;
        const items = GSItem.genericItems(me);
        if (items.length === 0) return;
        if (me.message) {
            me.#last = -1;
        } else {
            me.message = items[0].title;
        }
        me.#interval = setInterval(() => {
            if (me.#pause) return;
            me.#last++;
            if (me.#last >= items.length ) me.#last = 0;
            me.message = items[me.#last].title;
        }, me.delay * 1000);
        me.attachEvent(me.self, 'mouseover', () => me.#pause = true);
        me.attachEvent(me.self, 'mouseout', () => me.#pause = false);
    }

    onReady() {
        const me = this;
        const btn = me.query('.btn-close');
        me.attachEvent(btn, 'click', me.#onClick.bind(me));
        super.onReady();
        me.#billboard();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const el = me.self.firstElementChild;

        if (name == 'message') GSDOM.setHTML(me.query('slot'), me.message);

        if (name == 'css') {
            GSDOM.toggleClass(el, oldValue, false);
            GSDOM.toggleClass(el, newValue, true);
        }

        if (name == 'active') GSDOM.toggleClass(el, activeCSS, !me.#state);
    }

    get template() {
        const me = this;
        return `
        <div class="alert ${me.css} ${this.styleID}" data-css-id="${this.styleID}" role="class">
            <slot>${me.message}</slot>
            ${me.dismissible ? me.#dismissCSS : ''}
        </div>`;
    }

    get css() {
        const tmp = this.dismissible ? 'alert-dismissible fade show' : '';
        return GSAttr.get(this, 'css') + ` ${tmp}`;
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get activeCSS() {
        return GSAttr.get(this, 'css-active', 'd-none');
    }

    set activeCSS(val = '') {
        return GSAttr.get(this, 'css-active', val);
    }

    get message() {
        return GSAttr.get(this, 'message');
    }

    set message(val = '') {
        return GSAttr.set(this, 'message', val);
    }

    get dismissible() {
        return GSAttr.getAsBool(this, 'dismissible', false);
    }

    set dismissible(val = '') {
        return GSAttr.setAsBool(this, 'dismissible', val);
    }

    get delay() {
        return GSAttr.getAsNum(this, 'delay', 5);
    }

    set delay(val = 5) {
        return GSAttr.setAsNumt(this, 'delay', val);
    }

    async #dismiss() {
        const me = this;
        GSDOM.toggleClass(me.query('.alert'), 'show', false);
        await GSUtil.timeout(GSDOM.SPEED);
        return me.remove();
    }

    dismiss() {
        return this.#dismiss();
    }

    toggle() {
        this.active = !this.active;
    }

    /**
     * Prevent shadow dom
     */
    get isFlat() {
        return GSAttr.getAsBool(this, 'flat', true);
    }

    get anchor() {
        return 'self';
    }

}

