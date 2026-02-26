/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSDataListExt class
 * @module components/ext/GSDataListExt
 */

import { ButtonTypes } from '../../properties/index.mjs';
import { OWNER, PARENT } from "../../base/GSConst.mjs";
import { GSDOM } from "../../base/GSDOM.mjs";
import { GSEvents } from "../../base/GSEvents.mjs";
import { mixin } from "./EventsMixin.mjs";
import { GSAttr } from '../../base/GSAttr.mjs';
import { ControllerHandler } from './ControllerHandler.mjs';
import { ButtonController } from './controllers/ButtonController.mjs';

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

    #formEl = undefined;
    #hasUpdated = false;
    #controllerHandler = undefined;
    #buttonController = undefined;

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        if (me.isSubmit || me.isReset || me.isManaged) {
            me.#buttonController = new ButtonController(me);
        }        
        me.#controllerHandler?.connectedCallback();        
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

    }

    willUpdate(changed, oldValue, newValue) {
        if (changed === 'disabled') {
            this.emit('disabled', this.disabled, true, true, true);
        }
    }

    addController(controller) {
        const me = this;
        me.#controllerHandler ??= new ControllerHandler(me);
        me.#controllerHandler?.addController(controller);
    }

    removeController(controller) {
        this.#controllerHandler?.removeController(controller);
    }

    get owner() {
        return this[OWNER]();
    }

    get parentComponent() {
        return this[PARENT]();
    }

    get hasUpdated() {
        return this.#hasUpdated;
    }

    get form() {
        const me = this;
        me.#formEl ??= super.form || me.owner?.form || me.closest?.('form');
        return me.#formEl;
    }
    
    get isValid() {
        return this.form ? this.form.checkValidity() : true;
    }

    /**
     * If attribute subtype is "submit", will manage 
     * disable / enable state as a submit button.
     * Used for cusotm buttons to be disabled on form validation state.
     */
    get isManaged() {
        return this.dataset.gsType==='submit';
    }

    get isSubmit() {
        return ButtonTypes.isSubmit(this.type);
    }

    get isReset() {
        return ButtonTypes.isReset(this.type);
    }

    /**
     * Limit button click rate in milliseconds.
     * If set to 0, no limit is applied.
     */
    get rateLimit() {
        return GSAttr.getAsNum(this, 'rate-limit', 0);
    }

}

