/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSFormExt class
 * @module components/ext/GSFormExt
 */

 import GSID from "../../base/GSID.mjs";
 import GSDOMObserver from '../../base/GSDOMObserver.mjs';
 import GSEvent from "../../base/GSEvent.mjs";
 import GSDOM from "../../base/GSDOM.mjs";
 
 /**
  * Add custom form processing to support forms in modal dialogs
  * <form is="gs-ext-form">
  * @class
  * @extends {HTMLFormElement}
  */
 export default class GSFormExt extends HTMLFormElement {
 
     static #actions = ['ok', 'reset', 'submit'];
 
     static {
         customElements.define('gs-ext-form', GSFormExt, { extends: 'form' });
         Object.seal(GSFormExt);
         GSDOMObserver.registerFilter(GSFormExt.#onMonitorFilter, GSFormExt.#onMonitorResult);
         GSDOMObserver.registerFilter(GSFormExt.#onMonitorFilter, GSFormExt.#onMonitorRemove, true);
     }
 
     static #onMonitorFilter(el) {
         return el instanceof HTMLFormElement && (el instanceof GSFormExt) === false;
     }
 
     static #onMonitorResult(el) {
         GSFormExt.#attachEvents(el);
     }
 
     static #onMonitorRemove(el) {
         GSEvent.deattachListeners(el);
     }
 
     constructor() {
         super();
     }
 
     static get observedAttributes() {
         return ['mask'];
     }
 
     connectedCallback() {
         const me = this;
         if (!me.id) me.setAttribute('id', GSID.id);
         GSFormExt.#attachEvents(me);
         //GSComponents.store(me);
     }
 
     disconnectedCallback() {
         const me = this;
         //GSComponents.remove(me);
         GSEvent.deattachListeners(me);
     }
 
     static #attachEvents(me) {
         GSEvent.attach(me, me, 'submit', GSFormExt.#onSubmit.bind(me));
         GSEvent.attach(me, me, 'action', GSFormExt.#onAction.bind(me));
         GSEvent.attach(me, me, 'click', GSFormExt.#onAction.bind(me));
     }
 
     /**
      * 
      * @param {*} e 
      * @param {*} own 
      */
     static #onAction(e) {
 
         const el = e.composedPath().shift();
         const action = el?.dataset.action || e.detail.action || el?.type;
         if (!GSFormExt.#actions.includes(action)) return;
 
         GSEvent.prevent(e);
         const me = this;
 
         switch (action) {
             case 'reset':
                 me.reset();
                 break;
             case 'ok':
             case 'submit':
                 GSFormExt.#onSubmit(e, me);
         }
 
     }
 
     /**
      * Trigger form submit only if form data is valid
      * @param {*} e 
      */
     static #onSubmit(e, own) {
         GSEvent.prevent(e);
         const me = own || this;
         const isValid = me.checkValidity() && me.isValid;
         if (!isValid) return me.reportValidity();
         const obj = GSDOM.toObject(me);
         const type = isValid ? 'submit' : 'invalid';
         const data = { type: type, data: obj, source: e, valid: isValid };
         GSEvent.send(me, 'form', data, true, true);
     }
 
     get isValid() {
         return GSDOM.queryAll(this,'input,select,textarea')
                     .map(el => el.checkValidity())
                     .filter(v => v === false).length === 0;
     }
 
     get buttonOK() {
         return GSFormExt.#buttonOK(this);
     }
 
     get buttonCancel() {
         return GSFormExt.#buttonCancel(this);
     }
 
     get buttonReset() {
         return GSFormExt.#buttonReset(this);
     }
 
     static #buttonOK(own) {
         return GSDOM.query(own, 'button[type="submit"]');
     }
 
     static #buttonCancel(own) {
         return GSFormExt.#find(own, 'cancel');
     }
 
     static #buttonReset(own) {
         return GSFormExt.#find(own, 'reset');
     }
 
     static #find(own, name = '') {
         return GSDOM.query(own, `button[data-action="${name}"]`);
     }
 
 }
 
 