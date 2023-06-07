/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSContext class
 * @module components/GSContext
 */

import GSElement from "../base/GSElement.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSItem from "../base/GSItem.mjs";
import GSLoader from "../base/GSLoader.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSFunction from "../base/GSFunction.mjs";
import GSMenu from "./GSMenu.mjs";

/**
 * Context menu
 *
 * @class
 * @extends {GSElement}
 */
export default class GSContext extends GSElement {

  #online = false;
  #ready = false;
  #attached = false;

  static {
    customElements.define('gs-context', GSContext);
    Object.seal(GSContext);
  }

  static get observedAttributes() {
    const attrs = ['title', 'css', 'data'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    GSItem.validate(this, this.tagName);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;

    if (name === 'data') return this.load(newValue);

  }

  async getTemplate(val = '') {
    const me = this;
    if (!val && me.childElementCount > 0) return me.#renderMenuDOM();
    return super.getTemplate(val);
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;
    me.#online = true;
  }

  disconnectedCallback() {
    const me = this;
    me.#online = false;
    super.disconnectedCallback();
  }

  onReady() {
    const me = this;
    if (me.#ready) return;
    me.#ready = true;
    me.close();
    me.attachEvent(document, 'gs-component', me.#attachTarget.bind(me));
    //me.attachEvent(me.#menu, 'mouseleave', me.close.bind(me));
    me.attachEvent(me.#menu, 'action', me.#onClick.bind(me));
    me.attachEvent(me.#menu, 'open', e => GSEvents.send(me, 'open', e.detail));
    me.attachEvent(me.#menu, 'close', e => GSEvents.send(me, 'close', e.detail));
    me.attachEvent(window, 'resize', me.#onResize.bind(me));
    me.#attachTarget();
    super.onReady();
  }

  reattach() {
    const me = this;
    me.#attached = false;
    me.removeEvent(document, 'contextmenu');
    GSDOM.queryAll(document.documentElement, me.target).forEach(target => me.removeEvent(target, 'contextmenu'));
    me.#attachTarget();
  }

  get isFlat() {
    return this.parentElement !== document.body;
  }

  /**
   * NOTE: Fixed positioning must be rendered in body element 
   * to prevent css translate coordinates.
   */
  get anchor() {
    return 'beforeend@body';
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    return GSAttr.toggle(this, 'disabled', GSUtil.asBool(val));
  }

  get dark() {
    return GSAttr.getAsBool(this, 'dark');
  }

  get target() {
    return GSAttr.get(this, 'target');
  }

  close(e) {
    GSEvents.prevent(e);
    const me = this;
    me.#menu?.close();
  }

  open() {
    this.#menu?.open();
  }

  toggle() {
    const me = this;
    return me.disabled ? false : me.#menu?.toggle();
  }

  /**
   * Show submenu at x/y position on the screen
   * @param {number} x 
   * @param {number} y 
   * @returns {void}
   */
  popup(x = 0, y = 0, caller) {
    const me = this;
    return me.disabled ? false : me.#menu?.popup(x, y, caller);
  }

  /**
   * Create menu from JSON object
   * [{name:'', action:'', menu: []}]
   * @param {*} items 
   * @returns {boolean}
   */
  createMenu(items = []) {
    if (!Array.isArray(items)) return false;
    if (items.length === 0) return false;
    const me = this;
    const dark = me.dark ? 'dropdown-menu-dark' : '';
    const opts = GSMenu.fromJSON(items, dark);
    GSDOM.setHTML(me.#menu, opts.join(''));
    return true;
  }

  #renderMenuDOM() {
    const me = this;
    const css = me.dark ? 'dropdown-menu-dark' : ''
    return GSMenu.fromDOM(me.children, 0, css, true);
  }

  get #menu() {
    return this.query('.dropdown-menu');
  }

  #onResize(e) {
    this.close();
  }

  #match(e) {
    const me = this;
    return e.composedPath().filter(el => el.matches)
                 .filter(el => el.matches(me.target));
  }

  async #onPopup(e) {
    const me = this;
    const list = me.#match(e);
    if (list.length === 0) return;
    GSEvents.prevent(e);
    me.popup(e);
    return true;
  }

  /**
   * Attach context menu to target
   * 
   * @async
   * @returns {Promise}
   */
  async #attachTarget() {
    const me = this;
    if (!me.target) return;
    if (me.#attached) return;
    if (!me.target) return;
    const targets = GSDOM.queryAll(document.documentElement, me.target);
    if (targets.length === 0) {
      if (me.#online) {
        await GSUtil.timeout(1000);
        requestAnimationFrame(() => {
          me.#attachTarget();
        })
      }
      return;
    }
    me.#attached = true;
    targets.forEach(target => {
      me.attachEvent(target, 'contextmenu', me.#onPopup.bind(me));
    });
    me.removeEvent(document, 'gs-components');
    me.attachEvent(document, 'contextmenu', me.close.bind(me));
  }

  /**
   * Load data from various sources
   * Json format: array of json or json (child elemetns stored in item property
   * Any property will be rendered as gs-item element attribute
   * Example: [{title:"test2", message:"test2", items: [{title:"test2", message:"test2"}]}]
   * 
   * @async
   * @param {JSON|func|url} val 
   * @returns {Promise}
   */
  async load(val = '') {
    const data = await GSLoader.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    me.#ready = false;
    me.#attached = false;
    GSEvents.deattachListeners(me);
    const src = GSDOM.fromJsonAsString(data);
    GSDOM.setHTML(me, src);
    me.connectedCallback();
    return data;
  }

  async #onClick(e) {
    GSEvents.prevent(e);
    const me = this;
    const data = e.detail;
    const sts = await me.#onAction(data.data?.action);
    if (sts) return;
    data.type = 'contextmenu';
    GSEvents.send(me, 'action', data, true, true, true); // notify self
  }

  async #onAction(action) {
    let sts = false;
    if (!action) return sts;
    const me = this;
    try {
      action = GSUtil.capitalizeAttr(action);
      const fn = me[action];
      sts = GSFunction.isFunction(fn);
      sts = sts && !GSFunction.isFunctionNative(fn);
      if (sts) {
        if (GSFunction.isFunctionAsync(fn)) {
          await me[action]();
        } else {
          me[action]();
        }
      }
    } catch (e) {
      me.onError(e);
    }
    return sts;
  }

  onError(e) {
    console.log(e);
  }
}

