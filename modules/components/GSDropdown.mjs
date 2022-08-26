/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDropdown class
 * @module components/GSDropdown
 */

import GSElement from "../base/GSElement.mjs";
import GSItem from "../base/GSItem.mjs";
import GSEvent from "../base/GSEvent.mjs";
import GSLoader from "../base/GSLoader.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";

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
    const attrs = ['visible', 'title', 'css', 'data'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    GSItem.validate(this, this.tagName);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {

    const me = this;

    if (name === 'data') return this.load(newValue);

    if (name === 'visible') {
      me.#submenus.forEach(el => el.classList.remove('show'));
      const menu = me.#menu;
      if (!menu) return;
      GSDOM.toggleClass(menu, me.visible, 'show');
      if (me.visible) requestAnimationFrame(() => {
        me.#updatePos(menu);
      });
    }

    if (name === 'css') {
      GSDOM.toggleClass(me.#button, false, oldValue);
      GSDOM.toggleClass(me.#button, true, newValue);
    }

    if (name === 'title' && me.#button) {
      me.#button.innerHTML = newValue;
    }
  }

  #updatePos(el) {

    const style = window.getComputedStyle(el);

    const w = parseInt(style.width, 10);
    const l = parseInt(style.left, 10);
    const ww = parseInt(window.innerWidth, 10);

    const t = parseInt(style.top, 10);
    const h = parseInt(style.height, 10);
    const wh = parseInt(window.innerHeight, 10);

    if (l + w > ww) el.style.left = `${l - ((l + w) - ww)}px`;
    if (t + h > wh) el.style.top = `${t - ((t + h) - wh)}px`;
  }

  #updateSub(sub) {
    const me = this;
    const menu = me.#menu;

    const ww = parseInt(window.innerWidth, 10);
    const wh = parseInt(window.innerHeight, 10);

    const menustyle = window.getComputedStyle(menu);
    const substyle = window.getComputedStyle(sub);

    const ml = parseInt(menustyle.left, 10);
    const mw = parseInt(menustyle.width, 10);
    const mt = parseInt(menustyle.top, 10);
    const mh = parseInt(menustyle.height, 10);

    const sl = parseInt(substyle.left, 10);
    const sw = parseInt(substyle.width, 10);

    const st = parseInt(substyle.top, 10);
    const sh = parseInt(substyle.height, 10);

    if (sl + sw + ml + mw > ww) sub.style.left = `-${sw}px`;
    // if (st + sh + mt + mh > wh) sub.style.top = `${wh - ((st+sh) - wh)}px`;

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
    me.attachEvent(me.#menu, 'mouseleave', me.close.bind(me));
    me.#attachSubmenu();
    me.#attachItems();
    me.#updateSubmenus();
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

  get visible() {
    return GSAttr.getAsBool(this, 'visible');
  }

  set visible(val = '') {
    return GSAttr.setAsBool(this, 'visible', val);
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
    this.visible = false;
  }

  open() {
    this.visible = true;
  }

  toggle() {
    this.visible = !this.visible;
  }

  /**
   * Create menu from JSON object
   * [{name:'', action:'', menu: []}]
   * @param {Array<object>} items 
   * @returns {boolean} Status true if creation is ok
   */
  createMenu(items = []) {
    if (!Array.isArray(items)) return false;
    if (items.length === 0) return false;
    const me = this;
    const opts = me.#renderMenu(items);
    me.#menu.innerHTML = opts.join('');
    me.#attachItems();
    me.#attachSubmenu();
    return true;
  }

  #renderMenu(items = []) {
    const me = this;
    const dark = me.dark ? 'dropdown-menu-dark' : '';
    const opts = [];
    items.forEach(it => {
      if (it === '-') return opts.push('<li><hr class="dropdown-divider"/></li>');
      const hasSubmenu = Array.isArray(it.menu);
      opts.push('<li>');
      opts.push(`<a class="dropdown-item" href="#"`);
      if (it.action) opts.push(` data-action="${it.action}"`);
      opts.push('>');

      if (me.rtl) {

      } else {

      }
      opts.push(`${it.name} ${hasSubmenu ? '&raquo;' : ''}`);

      opts.push('</a>');

      if (hasSubmenu) {
        const sub = me.#renderMenu(it.menu);
        opts.push(`<ul class="submenu dropdown-menu ${dark}">`);
        opts.push(sub.join('\n'));
        opts.push('</ul>');
      }
      opts.push('</li>');

    });
    return opts;
  }

  get #menu() {
    return this.query('.dropdown-menu');
  }

  get #button() {
    return this.query('.dropdown-toggle');
  }

  get #items() {
    return this.queryAll('.dropdown-item');
  }

  get #submenus() {
    return this.queryAll('.submenu');
  }

  /**
   * Add click events to menu options
   */
  #attachItems() {
    const me = this;
    me.#items.filter(btn => btn.hasAttribute('data-action'))
      .forEach(btn => me.attachEvent(btn, 'click', me.#onClick.bind(me)));
  }

  #onClick(e) {
    const me = this;
    e.preventDefault();
    me.close();
    const opt = { type: 'dropdown', source: e };
    GSEvent.send(me, 'action', opt, true); // notify self
  }

  /**
   * Show proper submenu on mouse over
   * @param {Event} e 
   * @returns {void}
   */
  #onSubmenu(e) {
    const me = this;
    const li = e.target.closest('li');
    const ul = li.closest('ul');
    const sub = GSDOM.query(li, '.submenu');
    requestAnimationFrame(() => {
      GSDOM.queryAll(ul, '.submenu')
        .forEach(el => el.classList.remove('show'));
      if (sub) {
        const val = li.offsetTop;
        sub.style.top = `${val}px`;
        sub.classList.add('show');
        requestAnimationFrame(() => {
          me.#updateSub(sub);
        });
      }
    });
  }

  #updateSubmenus(overflowV = false, overflowH = false) {
    const me = this;
    me.#submenus.forEach(el => {
      el.style.position = 'absolute';
      el.style.left = 'inherit';
      el.style.right = 'inherit';
      el.style.top = 'inherit';
      if (overflowH) {
        el.style.right = '100%';
      } else {
        el.style.left = '100%';
      }
    });
  }

  /**
   * Attach mouseover for menu items that showa/hides submenu
   */
  #attachSubmenu() {
    const me = this;
    me.#items.forEach(el => me.attachEvent(el, 'mouseover', me.#onSubmenu.bind(me)));
  }

  #renderMenuDOM(children, level = 0) {
    const me = this;
    children = children || me.children;
    const list = [];

    const sub = level === 0 ? '' : 'submenu';

    if (level === 0 && me.title) {
      list.push('<div class="dropdown">');
      list.push(`<button class="btn dropdown-toggle ${me.css}" type="button" data-bs-toggle="dropdown">`);
      list.push(me.title);
      list.push('</button>');
    }

    list.push(`<ul class="${sub} dropdown-menu ${me.dark ? 'dropdown-menu-dark' : ''}">`);

    Array.from(children).forEach(el => {
      const isSub = el.childElementCount > 0;
      if (isSub) list.push(me.#renderSub(el));
      const html = isSub ? me.#renderMenuDOM(el.children, ++level) : me.#renderChild(el);
      list.push(html);
      if (sub) list.push(`</li>`);
    });

    list.push('</ul>');
    if (level === 0 && me.title) list.push('</div>');
    return list.join('');
  }

  #renderSub(el) {
    const name = GSAttr.get(el, 'name');
    return `<li><a class="dropdown-item" href="#">${name} &raquo; </a>`;
  }

  #renderChild(el) {
    const name = GSAttr.get(el, 'name');
    const action = GSAttr.get(el, 'action');
    const header = GSAttr.get(el, 'header');
    if (header) return `<li><h6 class="dropdown-header"/>${header}</h6></li>`;
    if (!name) return `<li><hr class="dropdown-divider"/></li>`;
    if (!action) return ``;
    return `<li><a class="dropdown-item" href="#" data-action="${action}">${name}</a></li>`;
  }

  /**
   * Load data from various sources
   * Json format: array of json or json (child elemetns stored in item property
   * Any property will be rendered as gs-item element attribute
   * Example: [{title:"test2", message:"test2", items: [{title:"test2", message:"test2"}]}]
   * @param {JSON|func|url} val 
   */
  async load(val = '') {
    const data = await GSLoader.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    me.innerHTML = GSItem.generateItem(data);
    GSEvent.deattachListeners(me);
    me.connectedCallback();
  }

}


