/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSDataListExt class
 * @module components/ext/GSDataListExt
 */

import { ButtonTypes } from '../../properties/index.mjs';
import { GSDOM } from "../../base/GSDOM.mjs";
import { GSEvents } from "../../base/GSEvents.mjs";
import { mixin } from "./EventsMixin.mjs";
import { GSAttr } from '../../base/GSAttr.mjs';
import { GSFunction } from '../../base/GSFunction.mjs';

/**
 * Add JSON loader to select element
 * <textarea is="gs-ext-textarea"></textarea>
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends { HTMLButtonElement }
 */
export class GSExtButtonElement extends HTMLButtonElement {

    static {
        mixin(GSExtButtonElement);
        GSDOM.define('gs-ext-button', GSExtButtonElement, { extends: 'button' });
        Object.seal(GSExtButtonElement);
    }

    static get observedAttributes() {
        return ['disabled'];
    }

    #hasUpdated = false;
    #controllerHandler = undefined;
    #formEl = undefined;

    constructor() {
        super();
        //this.#controllerHandler = ???
    }

    connectedCallback() {
        const me = this;
        me.#controllerHandler?.connectedCallback();
        me.#formEl = me.form;
        me.#preupdate();
    }

    disconnectedCallback() {
        const me = this;
        GSEvents.detachListeners(me);
        me.#controllerHandler?.disconnectedCallback();
        me.#controllerHandler = undefined;
        me.#formEl = undefined;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const me = this;
        me.#preupdate(name);
        me.willUpdate(name, oldValue, newValue);
        me.#controllerHandler?.hostUpdated(name);
    }

    #preupdate(name) {
        const me = this;
        if (!me.#hasUpdated) {
            me.firstUpdated(name);
            me.#controllerHandler?.hostUpdated(name);
            me.#hasUpdated = true;
        }
    }

    firstUpdated(changed) {
        const me = this;
        const form = me.#formEl;
        if (me.isSubmit && form) {
            me.attachEvent(form, 'change', me.#onFormState.bind(me));
            me.attachEvent(form, 'invalid', me.#onFormState.bind(me));
            const callback = me.#onClick.bind(me);
            const clickFn = me.rateLimit > 0 ? GSFunction.debounce(callback, me.rateLimit, true) : callback;
            me.on('click', clickFn);
        }
    }

    willUpdate(changed, oldValue, newValue) {
        if (changed === 'disabled') {
            this.emit('disabled', this.disabled, true, true, true);
        }
    }

    addController(controller) {
        this.#controllerHandler?.addController(controller);
    }

    removeController(controller) {
        this.#controllerHandler?.removeController(controller);
    }

    get owner() {
        return this[Symbol.for('gs-owner')]();
    }

    get parentComponent() {
        return this[Symbol.for('gs-parent')]();
    }

    get hasUpdated() {
        return this.#hasUpdated;
    }

    get form() {
        const me = this;
        return super.form || me.owner?.form || me.closest?.('form');
    }

    get isSubmit() {
        return ButtonTypes.isSubmit(this.type);
    }

    get isReset() {
        return ButtonTypes.isReset(this.type);
    }

    /**
     * Limit button click rate ini milliseconds.
     * If set to 0, no limit is applied.
     */
    get rateLimit() {
        return GSAttr.getAsNum(this, 'rate-limit', 0);
    }

    /**
     * If the button is part fo the form, check if form is valid
     * ba iterating all field elements and checkin it's validity state.
     * If not part of the form, always return true.
     * We use basic functionality, to support native non-extended form also
     */
    get isValid() {
        const elements = this.#formEl?.elements;
        return elements ? Array.from(elements)
            .filter(el => GSDOM.isFormElement(el))
            .filter(el => el.validity?.valid === false)
            .length === 0
            : true;
    }

    /**
     * If form is available, monitor elements change events
     * and validate form for validity to update disabled state button[type="submit"]
     * 
     * @param {*} e 
     */
    #onFormState(e) {
        const me = this;
        if (me.#formEl && me.isSubmit) {
            me.disabled = me.isValid === false;
        }
    }

    #onClick(e) {
        const me = this;
        if (me.#formEl && me.isSubmit) {
            if (me.isValid) {
                if (me.isSubmit) me.#formEl.requestSubmit();
                if (me.isReset) me.#formEl.reset();
            } else {
                GSEvents.prevent(e);
                me.disabled = true;
            }
        }
    }
}

