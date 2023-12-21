/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDropdown class
 * @module components/GSDropdown
 */

import GSElement from "../base/GSElement.mjs";
import GSItem from "../base/GSItem.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSLoader from "../base/GSLoader.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSMenu from "./GSMenu.mjs";
import GSLog from "../base/GSLog.mjs";

/**
 * Dropdown menu
 * @class
 * @extends {GSElement}
 */
export default class GSDropdown extends GSElement {

  #ready = false;

  static {
    customElements.define('gs-dropdown', GSDropdown);
    Object.seal(GSDropdown);
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

    if (name === 'css') {
      GSDOM.toggleClass(me.#button, oldValue, false);
      GSDOM.toggleClass(me.#button, newValue, true);
    }

    if (name === 'visible') {
      if (!me.visible) me.close();
    }

    if (name === 'title' && me.#button) {
      GSDOM.setHTML(me.#button, newValue);
    }
  }

  async getTemplate(val = '') {
    const me = this;
    if (!val && me.childElementCount > 0) return me.#renderMenuDOM();
    return super.getTemplate(val);
  }

  onReady() {
    const me = this;
    if (me.#ready) return;
    me.#ready = true;
    me.close();
    GSEvents.monitorAction(me, 'dropdown');
    super.onReady();
  }

  get css() {
    return GSAttr.get(this, 'css');
  }

  set css(val = '') {
    return GSAttr.set(this, 'css', val);
  }

  get title() {
    return GSAttr.get(this, 'title');
  }

  set title(val = '') {
    return GSAttr.set(this, 'title', val);
  }

  get dark() {
    return GSAttr.getAsBool(this, 'dark');
  }

  get isFlat() {
    const me = this;
    return GSAttr.getAsBool(me, 'flat', me.title ? false : true);
  }

  get anchor() {
    return 'afterend@self';
  }

  close() {
    this.#menu?.close();
  }

  open() {
    this.#menu?.open();
  }

  toggle() {
    this.#menu?.toggle();
  }

  /**
   * Create menu items from JSON object
   * [{name:'', action:'', menu: []}]
   * @param {Array<object>} items 
   * @returns {boolean} Status true if creation is ok
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

  get #menu() {
    return this.query('.dropdown-menu');
  }

  get #button() {
    return this.query('.dropdown-toggle');
  }

  #renderMenuDOM(children) {

    const me = this;
    children = children || me.children;
    const list = [];

    if (me.title) {
      list.push('<div class="dropdown">');
      list.push(`<button class="btn dropdown-toggle ${me.css}" type="button" data-bs-toggle="dropdown">`);
      list.push(me.title);
      list.push('</button>');
    }

    const css = me.dark ? 'dropdown-menu-dark' : ''
    const html = GSMenu.fromDOM(children, 0, css, true);
    list.push(html)

    if (me.title) list.push('</div>');
    return list.join('');
  }

  /**
   * Load data from various sources
   * Json format: array of json or json (child elements stored in item property
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
    GSEvents.deattachListeners(me);
    const src = GSDOM.fromJsonAsString(data);
    GSDOM.setHTML(me, src);
    me.connectedCallback();
    return data;
  }

  onError(e) {
    GSLog.error(null, e);
  }
}
