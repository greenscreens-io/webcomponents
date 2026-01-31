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

    #formBind = false;
    #formEl = undefined;
    #hasUpdated = false;
    #controllerHandler = undefined;

    constructor() {
        super();
        // this.#controllerHandler = new ControllerHandler(this);
    }

    connectedCallback() {
        const me = this;
        me.#controllerHandler?.connectedCallback();        
        me.#preupdate();
    }

    disconnectedCallback() {
        const me = this;
        GSEvents.detachListeners(me);
        me.#controllerHandler?.disconnectedCallback();
        me.#controllerHandler = undefined;
        me.#formEl = undefined;
        me.#formBind = false;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const me = this;
        me.#preupdate(name);
        me.willUpdate(name, oldValue, newValue);
        me.#controllerHandler?.hostUpdated(name);
    }

    #preupdate(name) {
        const me = this;
        me.form;
        if (!me.#hasUpdated) {            
            me.firstUpdated(name);
            me.#controllerHandler?.hostUpdated(name);
            me.#hasUpdated = true;
        }
    }

    firstUpdated(changed) {
      const me = this;
      if (me.isReset || me.isSubmit) {
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
        me.#formEl ??= super.form || me.owner?.form || me.closest?.('form');
        if (!me.#formBind && me.#formEl && me.isSubmit) {
            const callback = me.#onFormValidation.bind(me);
            // not helping, on last field, if invalid, skips button focus
            //['blur', 'change', 'invalid'].forEach(v => me.attachEvent(me.#formEl, v, callback, false, true));
            me.attachEvent(me.#formEl, 'validation', callback);
            me.#formBind = true;
        }
        return me.#formEl;
    }
    
    get isValid() {
        return this.form ? this.form.checkValidity() : true;
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

    #onFormValidation(e) {
        const me = this;
        me.disabled = e.detail.valid == false;
    }

    #onClick(e) {
        
        const me = this;
        if (me.form?.disabled) return;
        
        if (me.isReset) {
            return me.form?.reset();
        } 
        
        if (me.isSubmit) {
            if (me.isValid) {
                me.form?.requestSubmit();
            } else {
                me.disabled = true;
                GSEvents.prevent(e);
            }
        }
    }    
}

