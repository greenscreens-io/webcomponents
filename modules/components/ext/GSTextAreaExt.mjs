/*
 * Copyright (C) 2015, 2027 Green Screens Ltd.
 */

/**
 * A module loading GSInputExt class
 * @module components/ext/GSInputExt
 */

import GSID from "../../base/GSID.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSCSSMap from "../../base/GSCSSMap.mjs";
import GSDOMObserver from "../../base/GSDOMObserver.mjs";

/**
 * Add custom field processing
 * <input is="gs-ext-input">
 * @class
 * @extends {HTMLInputElement}
 */
export default class GSTextAreaExt extends HTMLTextAreaElement {

    #visual = false;

    static {
        customElements.define('gs-ext-textarea', GSTextAreaExt, { extends: 'textarea' });
        Object.seal(GSTextAreaExt);
        GSDOMObserver.registerFilter(GSTextAreaExt.#onMonitorFilter, GSTextAreaExt.#onMonitorResult);
    }

    static #onMonitorFilter(el) {
        return GSDOM.isFormElement(el);
    }

    static #onMonitorResult(el) {
        GSEvents.send(el, 'form-field', el, true, true, true);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return [];
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
        me.#attachEvents();
        GSComponents.store(me);
        if (me.autofocus) me.focus();
    }

    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSEvents.deattachListeners(me);
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    get owner() {
        const own = GSComponents.getOwner(this);
        return GSDOM.unwrap(own);
    }

    get filter() {
        const me = this;
        const filter = GSAttr.get(me, 'data-filter');
        return GSDOM.getByID(me.owner, filter);
    }

    get strict() {
        return GSAttr.get(this, 'strict', '');
    }

    get autocopy() {
        return this.hasAttribute('autocopy');
    }

    get autoselect() {
        return this.hasAttribute('autoselect');
    }

    get isVisible() {
        return GSDOM.isFieldVisible(this);
    }

    checkValidity() {
        this.#visual = false;
        return super.checkValidity();
    }
    
    reportValidity() {
        this.#visual = this.isVisible;
        // prevent browser console error on reportValidity if not visible
        return this.#visual ? super.reportValidity() : super.checkValidity();
    }

    #attachEvents() {
        const me = this;
        GSEvents.attach(me, me, 'input', me.#onInput.bind(me));
        GSEvents.attach(me, me, 'blur', me.#onBlur.bind(me));
        GSEvents.attach(me, me, 'click', me.#onClick.bind(me));
        GSEvents.attach(me, me, 'invalid', me.#onInvalid.bind(me));
    }

    #togleEl(el, key = '', value = '') {
        const data = GSAttr.get(el, `data-${key}`, '').split(/[,;;]/);
        const isMatch = value.length > 0 && data.includes(value);
        const frmel = GSDOM.isFormElement(el) || GSDOM.isButtonElement(el);
        if (frmel) {
            GSAttr.toggle(el, 'disabled', !isMatch);
        } else {
            isMatch ? GSDOM.show(el) : GSDOM.hide(el);
        }
        GSAttr.set(el, 'data-ignore', isMatch ? null : true);
        GSDOM.queryAll(el, 'input,textarea,select').forEach(el => GSAttr.set(el, 'data-ignore', isMatch ? null : true));
    }

    #onInvalid(e) {
        if (this.#visual && !this.isVisible) GSEvents.prevent(e);
        // todo BUBBLE so upper layer are aware 
    }

    #onClick(e) {
        const me = this;
        if (me.autocopy) navigator.clipboard.writeText(me.value);
        if (me.autoselect) me.select();
    }

    #onBlur(e) {
        const me = this;
        if (!me.checkValidity()) return me.reportValidity();
    }

    #onInput(e) {
        const me = this;
        me.value = me.#updateText(me.value);
    }

    reset() {
        GSDOM.reset(this);
    }
        
    #updateText(value = '') {
        const map = GSCSSMap.styleValue(this, 'text-transform');
        if (map) value = GSUtil.textTransform(map.value, value);
        return value;
    }
}
