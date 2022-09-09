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
import GSEvent from "../base/GSEvent.mjs";
import GSAttr from "../base/GSAttr.mjs";

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
    }

    #onClick(e) {
        const me = this;
        GSEvent.send(me, 'action', { type: 'alert', source: e }, true);
        me.dismiss();
    }

    onReady() {
        const me = this;
        const btn = me.query('.btn-close');
        me.attachEvent(btn, 'click', me.#onClick.bind(me));
        super.onReady();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const el = me.firstElementChild;

        if (name == 'message') GSDOM.setHTML(el, me.message);

        if (name == 'css') {
            GSDOM.toggleClass(el, false, oldValue);
            GSDOM.toggleClass(el, true, newValue);
        }

        if (name == 'active') GSDOM.toggleClass(el, !me.#state, activeCSS);
    }

    get template() {
        const me = this;
        return `
        <div class="alert ${me.css}" style="${this.getStyle()}" role="class">
            <slot>${me.message}</slot>
            ${me.dismissible ? me.#dismissCSS : ''}
        </class>`;
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
        return GSAttr.set(this, 'dismissible', GSUtil.asBool(val));
    }

    async #dismiss() {
        const me = this;
        GSDOM.toggleClass(me.query('.alert'), false, 'show');
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

