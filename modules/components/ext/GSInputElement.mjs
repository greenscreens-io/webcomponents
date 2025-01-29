/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSDOM } from '../../base/GSDOM.mjs';
import { GSData } from '../../base/GSData.mjs';
import { GSEvents } from '../../base/GSEvents.mjs';
import { AdoptedController } from '../../controllers/AdoptedController.mjs';
import { AttributeController } from '../../controllers/AttributeController.mjs';
import { CopySelectController } from './controllers/CopySelectController.mjs';
import { MaskController } from './controllers/MaskController.mjs';
import { MultipatternController } from './controllers/MultipatternController.mjs';
import { PasswordController } from './controllers/PasswordController.mjs';
import { NumberController } from './controllers/NumberController.mjs';
import { TextController } from './controllers/TextController.mjs';
import { ListController } from './controllers/ListController.mjs';

import { ReactiveInput } from './ReactiveInput.mjs';
import { ValidityController } from './controllers/ValidityController.mjs';

/**
 * Extended HTMLInputElement with controllers support
 * adding various features such as masked input support 
 */
export class GSInputElement extends ReactiveInput {

  static properties = {
    autocopy: { type: Boolean },
    autofocus: { type: Boolean },
    autoselect: { type: Boolean },
    reveal: { type: Boolean },
    mask: { reflect: true },
    multipattern: { type : Object},

    block: { type: Boolean },
    beep: { type: Boolean },
    timeout: { type: Number }
  }

  #adopted;
  #uiHandler;

  #copyselect;
  #maskController;
  #multiPatternController;
  #passwordController;
  #numberController;
  #textController;
  #listController;
  #validityController;

  constructor() {
    super();
    this.block = false;
    this.beep = false;
    this.timeout = 0;
    this.#copyselect = new CopySelectController(this);
    this.#validityController = new ValidityController(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.isBindable) this.binded();
  }

  disconnectedCallback() {
    GSEvents.deattachListeners(this);
    super.disconnectedCallback();
  }

  willUpdate(changed) {

    super.willUpdate(changed);
    const me = this;

    if (changed.has('mask') && me.mask && me.type === 'text') {
      me.placeholder = me.mask;
      me.#maskController ??= new MaskController(me);
    }

    if (changed.has('multipattern')) {
      const isMulti = Array.isArray(me.multipattern) && me.multipattern.length > 0;
      const isType = ['text', 'password'].includes(me.type);
      if (isMulti && isType) {
        me.#multiPatternController ??= new MultipatternController(me);
      }
    }

    if (me.list) {
      me.#listController ??= new ListController(me);
    }

    switch (me.type) {
      case 'text':
        me.#textController ??= new TextController(me);
        break;
      case 'password':
        me.#passwordController ??= new PasswordController(me);
        break;
      case 'number':
        me.#numberController ??= new NumberController(me);
        break;
    }
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    const me = this;
    if (me.autofocus) me.focus();    
    const data = me.formComponent?.data;
    if (data) GSDOM.fromObject2Element(me, data);
    me.checkValidity();
  }

  /**
   * Attach bindings
   */
  binded() {
    this.#uiHandler ??= new AttributeController(this);
  }

  /**
   * Handle bindings 
   * @param {*} e 
   */
  handle(e) {
    this.#uiHandler?.handle(e);
  }

  /**
   * Initialize dynamic style for component.
   * Call it from constructor for style to be applied to the component
   * Creates a dynamic StyleSheet which holds dynamic StyleRules
   * @param {String} id 
   * @param {String|Object} value 
   * @returns {CSSStyleRule}
   */
  dynamicStyle(id, value) {
    this.#adopted ??= new AdoptedController(me);
    return this.#adopted.style(id, value);
  }

  /**
   * Find element by its ID
   * @param {String} name 
   * @returns {HTMLElement}
   */
  getByID(query = '') {
    return GSDOM.getByID(this, query);
  }

  /**
   * Find closest top element by CSS selector
   * @param {String} query 
   * @returns {HTMLElement}
   */
  closest(query = '') {
    return GSDOM.closest(this, query);
  }

  /**
   * Generic component signal
   * @param {Boolean} bubbles  Does buuble to upper nodes
   * @param {Boolean} composed Does traverse from shadow DOM 
   */
  notify(bubbles = true, composed = false, data) {
    this.emit('notify', data, bubbles, composed, true);
  }

  /**
   * Send event
   * @param {String} name 
   * @param {Object} obj 
   * @param {Boolean} bubbles 
   * @param {Boolean} composed 
   * @param {Boolean} cancelable 
   */
  emit(name, obj = '', bubbles = false, composed = false, cancelable = false) {
    return GSEvents.send(this, name, obj, bubbles, composed, cancelable);
  }

  /**
   * Wait for event to happen
   * @async
   * @param {String} name 
   * @returns {Promise}
   */
  waitEvent(name = '', timeout = 0) {
    return GSEvents.wait(this, name, timeout);
  }

  /**
   * Listen once for triggered event
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @returns {Boolean}
   */
  once(name, func) {
    return this.listen(name, func, true);
  }

  /**
   * Alternative function for event listen
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @returns {Boolean}
   */
  on(name, func, once = false) {
    return this.listen(name, func, once);
  }

  /**
   * Alternative function for event unlisten
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @returns {Boolean}
   */
  off(name, func) {
    return this.unlisten(name, func);
  }

  /**
   * Prevent event firing up the DOM tree
   * @param {Event} e 
   */
  prevent(e) {
    GSEvents.prevent(e);
  }

  /**
   * Attach event to this element
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @returns {Boolean}
   */
  listen(name, func, once = false) {
    return this.attachEvent(this, name, func, once);
  }

  /**
   * Remove event from this element
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @returns {Boolean}
   */
  unlisten(name, func) {
    return this.removeEvent(this, name, func);
  }

  /**
  * Generic event listener appender
  * 
  * @param {HTMLElement} el Element on which to monitor for named events
  * @param {String} name Event name to watch for
  * @param {Function} fn Event trigger callback
  * @param {Boolean} once Listen only once
  * @returns {Boolean} State if attachment was successful
  */
  attachEvent(el, name = '', fn, once = false) {
    return GSEvents.attach(this, el, name, fn, once);
  }

  /**
  * Generic event listener remove
  * @param {HTMLElement} el Element on which to monitor for named events
  * @param {String} name Event name to watch for
  * @param {Function} fn Event trigger callback
  * @returns {Boolean} State if attachment was successful	
  */
  removeEvent(el, name = '', fn) {
    return GSEvents.remove(this, el, name, fn);
  }

  checkValidity() {
    const me = this;
    me.#validityController.reset();
    super.checkValidity();
    me.#multiPatternController?.checkValidity();
    me.#maskController?.checkValidity();
    super.checkValidity();
    return me.validity.valid;
  }

  reportValidity() {
    super.reportValidity();
    this.#validityController.report();
  }

  get formComponent() {
    return this.closest('gs-form');
  }

  get owner() {
    const own = GSDOM.root(this);
    return GSDOM.unwrap(own);
  }

  /**
   * Get parent GS-* component
   */
  get parentComponent() {
    return GSDOM.parentAll(this).filter(x => x instanceof GSElement).next()?.value;
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

  /**
   * Check if component is bindable to process data-gs-atributes
   */
  get isBindable() {
    return this.dataset.gsTarget;
  }

  /**
   * Return true if current element or chadow dom child is focused
   */
  get isFocused() {
    return this === document.activeElement;
  }

  /**
   * Element tag name
   */
  get tag() {
    return this.tagName.toLowerCase();
  }

  /**
   * Get this class name
   */
  get clazzName() {
    return this.constructor.name;
  }

  get definitions() {
    const list = [...GSDOM.inheritance(this)].map(o => o.constructor?.properties).filter(o => o);
    list.push(this.constructor?.properties);
    return GSData.mergeObjects(list);
  }

  /**
   * Extract and merge all static properties definition from WebComponent instance
   * @param {GSInputElement} obj 
   * @returns {Object}
   */
  static allProperties(obj) {
    const list = [...GSDOM.inheritance(obj)].map(o => o.properties).filter(o => o);
    list.push(obj.constructor?.properties || obj.properties);
    return GSData.mergeObjects(list);
  }

  /**
   * Register class as WebComponent to the browser
   * @param {String} name 
   * @param {class} clazz Optional, if not set, use self
   */
  static define(name, clazz) {
    if (!customElements.get(name)) {
      customElements.define(name, clazz || this, { extends: 'input' });
    }
  }

  static {
    GSInputElement.define('gs-ext-input', GSInputElement);
  }
}
