/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSDOM } from '../../base/GSDOM.mjs';
import { GSEvents } from '../../base/GSEvents.mjs';
import { OWNER, PARENT } from "../../base/GSConst.mjs";
import { MaskController } from './controllers/MaskController.mjs';
import { MultipatternController } from './controllers/MultipatternController.mjs';
import { ListController } from './controllers/ListController.mjs';
import { GSAttr } from '../../base/GSAttr.mjs';
import { GSUtil } from '../../base/GSUtil.mjs';
import { ControllerHandler } from './ControllerHandler.mjs';
import { mixin } from './EventsMixin.mjs';


/**
 * Extended HTMLInputElement with controllers support
 * adding various features such as masked input support 
 */
export class GSExtInputElement extends HTMLInputElement {

  static {
    mixin(GSExtInputElement);
    GSDOM.define('gs-ext-input', GSExtInputElement, { extends: 'input' });
    Object.seal(GSExtInputElement);
  }

  static get observedAttributes() {
    // 'autocopy', 'autofocus', 'autoselect', 'autovalidate','autoreport', 'block', 'beep', 'timeout', 
    return ['multipattern', 'mask', 'required', 'disabled'];
  }

  #controllerHandler = undefined;
  #maskController = undefined;
  #patternController = undefined;
  #listController = undefined;

  #pattern = undefined;
  #hasUpdated = false;

  constructor() {
    super();
    this.#controllerHandler = new ControllerHandler(this);
  }

  connectedCallback() {
    const me = this;
    me.#controllerHandler?.connectedCallback();
    me.#preupdate();
    me.dataset.value = me.value;
    me.on('change', e => me.dataset.value = me.value);
  }

  disconnectedCallback() {
    const me = this;
    me.#controllerHandler?.disconnectedCallback();
    me.#controllerHandler = undefined;

    me.#maskController = undefined;
    me.#patternController = undefined;
    me.#listController = undefined;
    me.#pattern = undefined;

    GSEvents.detachListeners(me);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const me = this;    
    if (me.isCheckBox && name === 'required' && me.required) return me.required = false;
    me.#preupdate(name);
    me.willUpdate(name, oldValue, newValue);
    me.#controllerHandler?.hostUpdated(name);
  }

  addController(controller) {
    this.#controllerHandler?.addController(controller);
  }

  removeController(controller) {
    this.#controllerHandler?.removeController(controller);
  }

  get owner() {
    return this[OWNER]();
  }

  /**
   * Get parent GS-* component
   */
  get parentComponent() {
    return this[PARENT]();
  }


  get hasUpdated() {
    return this.#hasUpdated;
  }

  get autocopy() {
    return this.hasAttribute('autocopy');
  }

  get autofocus() {
    return this.hasAttribute('autofocus');
  }

  get autoselect() {
    return this.hasAttribute('autoselect');
  }

  /**
   * If set, autoamtically calls reportValidity
   */
  get autoreport() {
    return this.hasAttribute('autoreport');
  }

  /**
   * If set, autoamtically calls checkValidity
   */
  get autovalidate() {
    return this.hasAttribute('autovalidate');
  }

  get beep() {
    return this.hasAttribute('beep');
  }

  get block() {
    return this.hasAttribute('block');
  }

  get mask() {
    return GSAttr.get(this, 'mask');
  }

  get multipattern() {
    return this.#pattern;
    //return GSDOM.getValue(this, 'multipattern');
  }

  // enable password reveal
  get reveal() {
    return this.hasAttribute('reveal');
  }

  get timeout() {
    return GSAttr.getAsNum(this, 'timeout', 0);
  }

  set autocopy(value) {
    GSAttr.toggle(this, 'autocopy', value);
  }

  set autofocus(value) {
    GSAttr.toggle(this, 'autocopy', value);
  }

  set autoselect(value) {
    GSAttr.toggle(this, 'autocopy', value);
  }

  set autoreport(value) {
    GSAttr.toggle(this, 'autoreport', value);
  }

  set autovalidate(value) {
    GSAttr.toggle(this, 'autovalidate', value);
  }

  set beep(value) {
    GSAttr.toggle(this, 'beep', value);
  }

  set block(value) {
    GSAttr.toggle(this, 'block', value);
  }

  set mask(value) {
    GSAttr.set(this, 'mask', value);
  }

  set multipattern(value) {
    let data = value;
    // convert to array if not, and stringify if values are regex
    if (GSUtil.isJsonType(value)) {
      const tmp = (Array.isArray(value) ? value : [value]).map(v => v.source || v.toString?.() || v);
      data = JSON.stringify(tmp);
    }
    GSAttr.set(this, 'multipattern', data);
  }

  /**
   * Useds only on password type to reveal 
   * password with key shortcut ctrl-altt-shift
   */
  set reveal(value) {
    if (this.type === 'password') GSAttr.toggle(this, 'reveal', value);
  }

  set timeout(value) {
    GSAttr.setAsNum(this, 'timeout', value);
  }

  get required() {
    return super.required;
  }

  set required(value) {
    super.required = this.isCheckBox ? false : GSUtil.asBool(value);
  }  

  get raw() {
    return super.value;
  }

  get value() {
    return this.#maskController ? this.#maskController.value : super.value;
  }

  set value(val) {
    super.value = this.mask === val ? '' : val;
  }

  get isAutocopy() {
    return this.autocopy || this.form?.autocopy;
  }

  get isAutoselect() {
    return this.autoselect || this.form?.autoselect;
  }

  get isAutovalidate() {
    return this.autovalidate || this.form?.autovalidate;
  }
  
  get isAutoreport() {
    return this.autoreport || this.form?.autoreport;
  }

  /**
   * Return true if current element or chadow dom child is focused
   */
  get isFocused() {
    return this === document.activeElement;
  }

  get isCheckBox() {
    return this.type === 'checkbox';
  }

  get form() {
    const me = this;
    return super.form || me.owner?.form || me.closest?.('form');
  }

  reset() {
    const me = this;
    me.setCustomValidity('');
    GSDOM.reset(me);
    me.#validate();
  }

  checkValidity() {
    this.#validate();
    return super.checkValidity();
  }

  reportValidity() {
    this.#validate();
    return super.reportValidity();
  }

  #validate(e) {
    return this.#controllerHandler.validate(e);
  }

  /**
   * Find closest top element by CSS selector
   * @param {String} query 
   * @returns {HTMLElement}
   */
  closest(query = '') {
    return GSDOM.closest(this, query);
  }


  firstUpdated(changed) {
    const me = this;
    if (me.autofocus) me.focus();
    const data = me.formComponent?.data;
    if (data) GSDOM.fromObject2Element(me, data);
  }

  willUpdate(changed, oldValue, newValue) {

    const me = this;

    if ('mask' === changed) {
      me.#updateMask();
    }

    if ('multipattern' === changed) {
      me.#updateMultipattern(newValue);
    }

    if ('list' === changed) {
      me.#updateList();
    }

    if (changed === 'required' || changed === 'disabled') {
      me.#validate();
    }
  }

  #preupdate(name) {
    const me = this;
    if (!me.#hasUpdated) {
      me.#updateMask();
      me.#updateMultipattern(me.pattern);
      me.#updateList();
      me.firstUpdated(name);
      me.#controllerHandler?.hostUpdated(name);
      me.#hasUpdated = true;
      me.#validate();
    }
  }

  #updateMask() {
    const me = this;
    if (me.mask && me.type === 'text') {
      me.placeholder = me.mask;
      me.#maskController ??= new MaskController(me);
    } else {
      me.removeController(me.#maskController);
      me.#maskController = null;
    }
  }

  #updateMultipattern(newValue) {
    const me = this;
    if (GSUtil.isJsonString(newValue)) {
      const tmp = GSUtil.toJson(newValue, []);
      me.#pattern = (Array.isArray(tmp) ? tmp : []).map(v => new RegExp(v));
    } else {
      me.#pattern = undefined;
    }

    const isMulti = Array.isArray(me.#pattern) && me.#pattern.length > 0;
    const isType = ['text', 'password'].includes(me.type);
    if (isMulti && isType) {
      me.#patternController ??= new MultipatternController(me);
    } else {
      me.removeController(me.#patternController);
      me.#patternController = null;
    }
  }

  #updateList() {
    const me = this;
    if (me.list) {
      me.#listController ??= new ListController(me);
    } else {
      me.removeController(me.#listController);
      me.#listController = null;
    }
  }

}
