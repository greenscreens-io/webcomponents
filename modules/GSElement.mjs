/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { templateContent, noChange, LitElement } from './lib.mjs';

import { GSEvents } from './base/GSEvents.mjs';
import { GSEnvironment } from './base/GSEnvironment.mjs';
import { GSFunction } from './base/GSFunction.mjs';
import { GSLocalization } from './base/GSLocalization.mjs';
import { AdoptedController } from './controllers/AdoptedController.mjs';
import { ContentController } from './controllers/ContentController.mjs';
import { AttributeController } from './controllers/AttributeController.mjs';
import { LocalizationController } from './controllers/LocalizationController.mjs';
import { OrientationController } from './controllers/OrientationController.mjs';
import { TemplateController } from './controllers/TemplateController.mjs';
import { orientation } from './properties/orientation.mjs';
import { protocol } from './properties/protocol.mjs';
import { environment } from './properties/environment.mjs';
import { ThemeController } from './controllers/ThemeController.mjs';
import { notEmpty } from './properties/verificator.mjs';
import { DataController } from './controllers/DataController.mjs';
import { GSDOM } from './base/GSDOM.mjs';
import { GSData } from './base/GSData.mjs';
import { GSUtil } from './base/GSUtil.mjs';
import { SlotController } from './controllers/SlotController.mjs';

/**
 * Main WebComponent used by all other GS-* components
 */
export class GSElement extends LitElement {

  static properties = {
    flat: { type: Boolean },
    rtl: { type: Boolean, reflect: true },
    hide: { type: Boolean, reflect: true },
    padding: { type: Number },
    margin: { type: Number },
    rounded: { type: Boolean },
    bordered: { type: Boolean },
    shadow: { type: Boolean },
    keep: { type: Boolean },

    onready: {},
    css: {},
    theme: {},

    os: {},
    browser: {},
    locale: { reflect: true, hasChanged: notEmpty },
    environment: environment,
    orientation: orientation,
    protocol: protocol,

    template: {}
  }

  #adopted;
  #uiHandler;
  #orientation;
  #localization;
  #dataController;
  #slotController;
  #themes
  #template;
  #content;

  constructor() {
    super();
    const me = this;
    me.css = '';
    me.locale = "";
    me.#adopted = new AdoptedController(me);
    me.#content = new ContentController(me);
    me.#localization = new LocalizationController(me);
    me.#orientation = new OrientationController(me);
    me.#template = new TemplateController(me);
    me.#themes = new ThemeController(me);
    me.#slotController = new SlotController(me);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.isBindable) this.binded();
  }

  disconnectedCallback() {
    GSEvents.deattachListeners(this);
    super.disconnectedCallback();
  }

  /**
   * Override Lit element createRenderRoot function.
   * If flat, do not create shadowDom, render within self
   * @returns 
   */
  createRenderRoot() {
    return this.flat ? this : super.createRenderRoot();
  }

  /**
   * Override Lit element firstUpdated function.
   * Here we call attribute script onready if available
   * Make sure that inherited classes calls super.firstUpdated
   */
  firstUpdated() {
    super.firstUpdated();
    const me = this;
    if (me.onready) {
      const owner = me.onready.startsWith('this') ? this : window;
      GSFunction.callFunction(me.onready, owner);
    }
  }

  /**
   * Override Lit element willUpdate function.
   * Make sure that inherited classes calls super.willUpdate
   * @param {*} changed 
   */
  willUpdate(changed) {
    const me = this;
    if (changed.has('storage')) {
      if (me.storage) {
        if (!me.#dataController) {
          me.#dataController = new DataController(me);
        } else {
          me.#dataController.relink();
        }
      } else {
        me.#dataController?.hostDisconnected();
        me.#dataController = undefined;
      }
    }
  }

  /**
   * Called when this element injected in some slot
   * @param {*} slot 
   */
  onSlotInjected(slot) {

  }

  /**
   * Override Lit element render function and control rendering
   * @returns {*} Parsed lit html structure
   */
  render() {
    return this.isAllowRender && !this.hide ? this.renderUI() : '';
  }

  /**
   * Actual render function to override in inherited components
   * @returns {*} Parsed lit html structure
   */
  renderUI() {
    return noChange;
  }

  /**
   * Render html from provided template element or template url
   * @returns {*}
   */
  renderTemplate() {
    return this.templateRef ? templateContent(this.templateRef) : ''
  }

  /**
   * Render this class css attributes.
   * @returns {Object} JSON object with CSS properties
   */
  renderClass() {
    const me = this;
    const obj = {
      'border': me.bordered,
      'shadow-sm': me.shadow,
      'rounded': me.rounded,
      [`p-${me.padding}`]: me.padding >= 0,
      [`m-${me.margin}`]: me.margin >= 0
    };
    return me.mapCSS(me.css, obj);
  }

  /**
   * Called when asynchronnous template is injected into component
   */
  templateInjected() {
    
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
   * Parse CSS string into JSON object
   * @param {String} css CSS string to parse into JSON object
   * @param {Object} obj JSON object to witch to add parsed CSS
   * @returns {Object} css parsed JSON object 
   */
  mapCSS(css, obj, flag = true) {
    obj = obj || {};
    (css || '').split(' ')
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .map(v => obj[v.trim()] = flag);
    return obj;
  }

  /**
   * Initialize dynamic style for component.
   * Call it from constructor for style to be applied to the component
   * Creates a dynamic StyleSheet which holds dynamic StyleRules for template elements
   * @param {String} id 
   * @param {String|Object} value 
   * @param {boolean} isGlobal 
   * @returns {CSSStyleRule}
   */
  dynamicStyle(id, value, isGlobal = false) {
    return this.#adopted.style(id, value, isGlobal);
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
   * Find element by CSS selector (top level is this element)
   * @param {String} name 
   * @returns {HTMLElement}
   */
  query(query = '', shadow = false) {
    return GSDOM.query(this, query, false, shadow);
  }

  /**
   * Find multiple elements by CSS selector (top level is this element)
   * @param {String} query 
   * @returns {Array<HTMLElement>}
   */
  queryAll(query = '', shadow = false) {
    return GSDOM.queryAll(this, query, false, shadow);
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

  /**
   * Generic element hide function
   */
  toggle() {
    this.hide = !this.hide;
  }

  translate(value) {
    return GSLocalization.translate(this.locale, value);
  }

  get direction() {
    if (GSUtil.isNull(this.rtl)) return undefined;
    return this.rtl ? 'rtl' : 'ltr';
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
   * Reference to cached template if set
   */
  get templateRef() {
    return this.#template.template;
  }

  /**
   * Reference to rendered content
   */
  get contentRef() {
    return this.#content.contentRef;
  }

  /**
   * Reference to data controller if initialized
   */
  get dataController() {
    return this.#dataController;
  }

  /**
  * Check if element is allowed to be rendered
  * @returns {Boolean} 
  */
  get isAllowRender() {
    return this.isValidEnvironment
      && this.isValidBrowser
      && this.isValidOS
      && this.isValidProtocol
      && this.isValidOrientation;
  }

  /**
   * Returns if environment matched
   * dektop, mobile, tablet, android, linux, winwdows, macos
   * @returns {Boolean} 
   */
  get isValidEnvironment() {
    return GSEnvironment.isValidEnvironment(this.environment);
  }

  /**
   * Return true if element can be rendered bysed on OS matching
   * linux, windows...etc
   * @returns {Boolean} 
   */
  get isValidOS() {
    return GSEnvironment.isDevice(this.os);
  }

  /**
   * Returns if orientation matched for element rendering
   * horizontal | landscape), vertical | portrait), ; return true if not set
   * @returns {Boolean} 
   */
  get isValidOrientation() {
    return GSEnvironment.isValidOrientation(this.orientation);
  }

  /**
   * Returns if browser matched, used to determine rendering/removal
   * @returns {Boolean} 
   */
  get isValidBrowser() {
    return GSEnvironment.isValidBrowser(this.browser);
  }

  /**
   * Returns if browser matched, used to determine rendering/removal
   * @returns {Boolean} 
   */
  get isValidProtocol() {
    return GSEnvironment.isValidProtocol(this.protocol);
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
   * Get instance of internal styles
   */
  get elementStyles() {
    return this.constructor.elementStyles.map(s => Object.values(s).filter(o => o instanceof CSSStyleSheet).pop()).pop();
  }

  /**
   * Internal shadow styles rule
   * @param {*} name 
   * @returns 
   */
  cssRule(name) {
    return Array.from(this.elementStyles.rules).filter(r => r.selectorText === name).pop();
  }

  /**
   * Set dynamic CSS rule 
   * See GSIcon hot it is done
   * @param {*} rule 
   * @param {*} name 
   * @param {*} value 
   */
  setCSSProperty(rule, name, value) {
    this.cssRule(rule).style.setProperty(name, value);
  }

  /**
   * Extract and merge all static properties definition from WebComponent instance
   * @param {GSElement} obj 
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
   * @param {Object} opt Options, used only when extending non HTMLElement class  
   */
  static define(name, clazz, opt) {
    if (!customElements.get(name)) {
      customElements.define(name, clazz || this, opt);
    }
  }

}
