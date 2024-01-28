/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSDOM } from '../../base/GSDOM.mjs';
import { GSData } from '../../base/GSData.mjs';
import { GSEvents } from '../../base/GSEvents.mjs';
import { AdoptedController } from '../../controllers/AdoptedController.mjs';
import { AttributeController } from '../../controllers/AttributeController.mjs';
import { CopySelectController } from './controllers/CopySelectController.mjs';
import { MaskController } from './controllers/MaskController.mjs';
import { PasswordController } from './controllers/PasswordController.mjs';
import { NumberController } from './controllers/NumberController.mjs';
import { TextController } from './controllers/TextController.mjs';
import { ListController } from './controllers/ListController.mjs';

import { ReactiveInput } from './ReactiveInput.mjs';

/**
 * Extended HTMLInputElement with controllers support
 * adding various feature such as masked input support 
 */
export class GSInputElement extends ReactiveInput {

  static properties = {
    autocopy: { type: Boolean },
    autofocus: { type: Boolean },
    autoselect: { type: Boolean },
    reveal: { type: Boolean },
    mask: { reflect: true }
  }

  #adopted;
  #uiHandler;

  #copyselect;
  #maskController;
  #passwordController;
  #numberController;
  #textController;
  #listController;

  constructor() {
    super();
    this.#copyselect = new CopySelectController(this);
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

    if (changed.has('mask') && this.mask) {
      this.placeholder = this.mask;
      this.#maskController ??= new MaskController(this);
      this.#maskController.initRules();
    }

    if (this.list) {
      this.#listController ??= new ListController(this);
    }

    switch (this.type) {
      case 'text':
        this.#textController ??= new TextController(this);
        break;
      case 'password':
        this.#passwordController ??= new PasswordController(this);
        break;
      case 'number':
        this.#numberController ??= new NumberController(this);
        break;
    }
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    if (this.autofocus) this.focus();
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

  get owner() {
    const own = GSDOM.root(this);
    return GSDOM.unwrap(own);
  }

  get raw() {
    return super.value;
  }

  get value() {
    return this.#maskController ? this.#maskController.value : super.value;
  }

  set value(val) {
    super.value = val;
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
