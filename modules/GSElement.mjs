/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
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
import { GSAttributeHandler } from './base/GSAttributeHandler.mjs';
import { GSDOMObserver } from './base/GSDOMObserver.mjs';
import { GSID } from './base/GSID.mjs';
import { GSCacheStyles } from './base/GSCacheStyles.mjs';

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
    language: { reflect: true, hasChanged: notEmpty },
    environment: environment,
    orientation: orientation,
    protocol: protocol,

    template: {}
  }

  #adopted = undefined;
  #uiHandler = undefined;
  #orientation = undefined;
  #localization = undefined;
  #dataController = undefined;
  #slotController = undefined;
  #themes = undefined;
  #template = undefined;
  #content = undefined;
  
  #ref = undefined;
  #refs = undefined;
  #refx = undefined;

  constructor() {
    super();
    const me = this;
    me.css = '';
    me.language = "";
    me.#adopted = new AdoptedController(me);
    me.#content = new ContentController(me);
    me.#localization = new LocalizationController(me);
    me.#orientation = new OrientationController(me);
    //me.#template = new TemplateController(me);
    me.#themes = new ThemeController(me);
    me.#slotController = new SlotController(me);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;
    const tpl = GSDOM.templateRef(me);
    if (tpl) me.#template = new TemplateController(me);
    if (me.isBindable) me.binded();
  }

  disconnectedCallback() {
    const me = this;
    GSEvents.detachListeners(this);
    super.disconnectedCallback();
    me.#ref?.clear();
    me.#refs?.clear();
    me.#refx?.clear();
    me.#ref = null;
    me.#refs = null;
    me.#refx = null;
    me.#adopted = null;
    me.#uiHandler = null;
    me.#orientation = null;
    me.#localization = null;
    me.#dataController = null;
    me.#slotController = null;
    me.#themes = null;
    me.#template = null;
    me.#content = null;
    //me.renderOptions = null;
    me.adoptedStyleSheets = [];
    GSCacheStyles.deleteRule(me.#ruleName, true);
    const shadow = this.shadowRoot;
    if (shadow) {
      //if (shadow._$litPart$) shadow._$litPart$ = null;
      shadow.adoptedStyleSheets = [];
      // shadow.innerHTML = '';
      //GSDOM.cleanup(shadow);
      queueMicrotask(() => GSDOM.cleanup(shadow));
    }
    queueMicrotask(() => GSDOM.cleanup(me));
    // GSDOM.cleanup(me);
    // console.log('deleted', me);
  }

  shouldUpdate(changedProperties) {
    return this.isConnected; // && this.isAllowRender;
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
    if (changed.has('hide')) {
      me.#updateHide();
    }
    if (changed.has('storage')) {
      me.#updateStorage();
    }
  }

  get #ruleName() {
    const me = this;
    me.id = me.id ? me.id : GSID.id;
    return `${me.tagName.toLowerCase()}#${me.id}`;
  }

  #updateHide() {
    const me = this;
    const value = me.hide ? 'none' : '';
    GSCacheStyles.setRule(me.#ruleName, {display:value}, false, true);
  }
  
  #updateStorage() {
    const me = this;
    me.#dataController?.hostDisconnected();
    me.#dataController = undefined;
    if (me.storage) {
      me.#dataController = new DataController(me);
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
    // repalced by #updateHide
    //return this.isAllowRender && !this.hide ? this.renderUI() : '';
    return this.isAllowRender ? this.renderUI() : '';
  }

  /**
   * Actual render function to override in inherited components
   * @returns {*} Parsed lit html structure
   */
  renderUI() {
    return this.renderTemplate();
  }

  /**
   * Render html from provided template element or template url
   * @returns {*}
   */
  renderTemplate() {
    return this.templateRef ? templateContent(this.templateRef) : noChange;
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
   * @param {Object} obj JSON object to which to add parsed CSS
   * @param {boolean} flag Default activation (true|false) for each CSS property
   * @returns {Object} css parsed JSON object 
   */
  mapCSS(css, obj, flag = true) {
    obj = obj || {};
    (css || '').split(' ')
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .forEach(v => obj[v.trim()] = flag);
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
    return this.#adopted?.style(id, value, isGlobal);
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
   * @param {Number} levels - walk limit
   * @returns {HTMLElement}
   */
  closest(query = '', levels = -1, cached = false) {
    const me = this;

    let result = me.#refx?.get(query);
    if (result && !result.isConnected) {
      result = undefined;
      me.#refx?.delete(query);
    }
    result ??= GSDOM.closest(this, query, levels);
    
    if (result && cached && !me.#ref?.has(query)) {
      me.#refx ??= new Map();
      me.#refx.set(query, result);
    }
    return result;
  }

  /**
   * Find element by CSS selector (top level is this element)
   * @param {String} name 
   * @returns {HTMLElement}
   */
  query(query = '', shadow = false, cached = false) {
    const me = this;

    let result = me.#refs?.get(query);
    if (result && !result.isConnected) {
      result = undefined;
      me.#refs?.delete(query);
    }
    result ??= GSDOM.query(this, query, false, shadow);
    
    if (result && cached && !me.#ref?.has(query)) {
      me.#ref ??= new Map();
      me.#ref.set(query, result);
    }
    return result;
  }

  /**
   * Find multiple elements by CSS selector (top level is this element)
   * @param {String} query 
   * @returns {Array<HTMLElement>}
   */
  queryAll(query = '', shadow = false, cached = false) {
    const me = this;
    let result = me.#refs?.get(query);
    if (result && !result.isConnected) {
      result = undefined;
      me.#refs?.delete(query);
    }
    result ??= GSDOM.queryAll(this, query, false, shadow);
    if (result && cached && !me.#refs?.has(query)) {
      me.#refs ??= new Map();
      me.#refs.set(query, result);
    } 
    return result;        
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
  prevent(e, defaults, propagate, immediate) {
    return GSEvents.prevent(e, defaults, propagate, immediate);
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
    return GSLocalization.translate(this.language, value);
  }

  get direction() {
    if (GSUtil.isNull(this.rtl)) return undefined;
    return this.rtl ? 'rtl' : 'ltr';
  }

  /**
   * Check if component is bindable to process data-gs-atributes
   */
  get isBindable() {
    //return this.dataset.gsTarget;
    return GSAttributeHandler.isBindable(this);
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
    return this.#template?.template;
  }

  /**
   * Reference to rendered content
   */
  get contentRef() {
    return this.#content?.contentRef;
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
    // this.isConnected &&
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
    return GSEnvironment.isValidEnvironment(this.environment ?? '');
  }

  /**
   * Return true if element can be rendered bysed on OS matching
   * linux, windows...etc
   * @returns {Boolean} 
   */
  get isValidOS() {
    return GSEnvironment.isDevice(this.os ?? '');
  }

  /**
   * Returns if orientation matched for element rendering
   * horizontal | landscape), vertical | portrait), ; return true if not set
   * @returns {Boolean} 
   */
  get isValidOrientation() {
    return GSEnvironment.isValidOrientation(this.orientation ?? '');
  }

  /**
   * Returns if browser matched, used to determine rendering/removal
   * @returns {Boolean} 
   */
  get isValidBrowser() {
    return GSEnvironment.isValidBrowser(this.browser ?? '');
  }

  /**
   * Returns if browser matched, used to determine rendering/removal
   * @returns {Boolean} 
   */
  get isValidProtocol() {
    return GSEnvironment.isValidProtocol(this.protocol ?? '');
  }

  /**
   * Internal attribute set if component is generated by other components
   */
  get isGenerated() {
    return this.hasAttribute('generated');
  }

  /**
   * Get parent GS-* component
   */
  get parentComponent() {
    return GSDOM.parentAll(this).filter(x => x instanceof GSElement).next()?.value;
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
    return this.constructor.elementStyles
        .filter(o => o instanceof CSSStyleSheet || o.styleSheet instanceof CSSStyleSheet)
        .map(o => o.styleSheet || o)
        .pop();    
    /*
    .map(s => {
       Object.values(s)
        .filter(o => o instanceof CSSStyleSheet || o instanceof CSSResult)
        .map(o => o.styleSheet || o)
        .pop()
    }).pop();
    */
  }

  /**
   * Internal shadow styles rule
   * @param {*} name 
   * @returns 
   */
  cssRule(name) {
    return Array.from(this.elementStyles?.rules ?? []).filter(r => r.selectorText === name).pop();
  }

  /**
   * Set dynamic CSS rule 
   * See GSIcon hot it is done
   * @param {*} rule 
   * @param {*} name 
   * @param {*} value 
   */
  setCSSProperty(rule, name, value) {
    this.cssRule(rule)?.style?.setProperty(name, value);
  }

  /**
   * Extract and merge all static properties definition from WebComponent instance
   * @param {GSElement} obj 
   * @returns {Object}
   */
  static allProperties(obj) {
    return GSDOM.allProperties(obj);
  }

  /**
   * Register class as WebComponent to the browser
   * @param {String} name 
   * @param {class} clazz Optional, if not set, use self
   * @param {Object} opt Options, used only when extending non HTMLElement class  
   */
  static define(name, clazz, opt) {
    return GSDOM.define(name, clazz || this, opt);
  }

  static {
    GSElement.define('gs-element', GSElement);
    // global document element removal monitor, help GS cleanup
    GSDOMObserver.registerFilter(el => true, el => { GSDOM.cleanup(el) }, true, document.body);
  }
}
