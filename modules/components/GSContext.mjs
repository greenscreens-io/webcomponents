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
import GSEvent from "../base/GSEvent.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";

/**
 * Context menu
 *
 * @class
 * @extends {GSElement}
 */
export default class GSContext extends GSElement {

  // element that opened context
  #caller = null;

  #online = false;
  #ready = false;
  #attached = false;

  static {
    customElements.define('gs-context', GSContext);
    Object.seal(GSContext);
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
      if (menu) GSDOM.toggleClass(menu, 'show', me.visible);
    }
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
    me.attachEvent(me.#menu, 'mouseleave', me.close.bind(me));
    me.attachEvent(window, 'resize', me.#onResize.bind(me));
    me.#attachSubmenu();
    me.#attachOptions();
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

  get visible() {
    return GSAttr.getAsBool(this, 'visible');
  }

  set visible(val = '') {
    return GSAttr.setAsBool(this, 'visible', val);
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
    if (e instanceof Event) e.preventDefault();
    this.visible = false;
  }

  open() {
    this.visible = true;
  }

  toggle() {
    this.visible = !this.visible;
  }

  /**
   * Show submenu at x/y position on the screen
   * @param {number} x 
   * @param {number} y 
   * @returns {void}
   */
  popup(x = 0, y = 0) {
    const me = this;
    if (me.disabled) return;
    const menu = me.#menu;
    if (!menu) return;
    requestAnimationFrame(() => {
      menu.style.position = 'fixed';
      menu.style.top = '0px';
      menu.style.left = '0px';
      menu.style.transform = `translate(${x}px, ${y}px)`;
      me.visible = true;
    });

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
    const opts = me.#renderMenu(items);
    GSDOM.setHTML(me.#menu, opts.join(''));
    me.#attachOptions();
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
      opts.push(`<a class="dropdown-item ${hasSubmenu ? 'droppdown-toggle' : ''}" href="#"`);
      if (it.action) opts.push(` data-action="${it.action}"`);
      opts.push(`><div class="d-inline-block w-100">${it.name}</div></a>`);
      //opts.push(`>${it.name} ${hasSubmenu ? '&raquo;' : ''}</a>`);
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

  get #items() {
    return this.queryAll('.dropdown-item', true);
  }

  get #submenus() {
    return this.queryAll('.submenu', true);
  }

  #onResize(e) {
    this.close();
  }

  async #onPopup(e) {
    GSEvent.prevent(e);
    const me = this;
    me.#caller = e.target;
    me.popup(e.clientX, e.clientY);
    await GSUtil.timeout(15);
    me.#updateSubmenus(e);
    return true;
  }

  #updateSubmenus(e) {
    
    const me = this;
    const rect = me.#menu?.getBoundingClientRect();
    if (!rect) return;
    requestAnimationFrame(() => {
      let x = e.clientX, y = e.clientY;
      const overflowH = x + rect.width > window.innerWidth;
      const overflowV = y + rect.height > window.innerHeight;
      if (overflowH) x = window.innerWidth - rect.width;
      if (overflowV) y = window.innerHeight - rect.height;      
      me.#submenus.forEach(el => {
        let end = true;
        el.style.position = 'absolute';
        el.style.left = 'inherit';
        el.style.right = 'inherit';
        el.style.top = 'inherit';
        if (overflowH) {
          el.style.right = '100%';
          end = false;          
        } else {
          el.style.left = '100%';
          end = true;
        }
        GSDOM.toggleClass(me.#menu, 'dropstart', !end);
        GSDOM.toggleClass(me.#menu, 'dropend', end);
      });
    });
  }

  /**
   * Add click events to menu options
   */
  #attachOptions() {
    const me = this;
    me.#items.filter(btn => btn.dataset.action)
      .forEach(btn => me.attachEvent(btn, 'click', me.#onClick.bind(me)));
  }

  #onClick(e) {
    const me = this;
    e.preventDefault();
    me.close();
    const data = e.target.dataset;
    const opt = { type: 'contextmenu', option: e.target, caller: me.#caller, data: data };
    GSEvent.send(me, 'action', opt, true, true, true); // notify self
  }

  /**
   * Show proper submenu on mouse over
   * @param {Event} e 
   * @returns {void}
   */
  #onSubmenu(e) {
    const li = e.target.parentElement;
    const ul = li.parentElement;
    const sub = GSDOM.query(li, '.submenu');
    requestAnimationFrame(() => {
      GSDOM.queryAll(ul, '.submenu')
        .forEach(el => el.classList.remove('show'));
      if (sub) {
        sub.style.top = `${sub.parentElement.offsetTop}px`;
        sub.classList.add('show');
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
    targets.forEach(target => me.attachEvent(target, 'contextmenu', me.#onPopup.bind(me)));
    me.removeEvent(document, 'gs-components');
    me.attachEvent(document, 'contextmenu', me.close.bind(me));
  }

  #renderMenuDOM(children, level = 0) {
    const me = this;
    children = children || me.children;
    const list = [];

    const sub = level === 0 ? 'dropend position-fixed' : 'submenu';

    list.push(`<ul class="${sub} dropdown-menu ${me.dark ? 'dropdown-menu-dark' : ''}">`);

    Array.from(children).forEach(el => {
      const isSub = el.childElementCount > 0;
      if (isSub) list.push(me.#renderSub(el));
      const html = isSub ? me.#renderMenuDOM(el.children, ++level) : me.#renderChild(el);
      list.push(html);
      if (sub) list.push(`</li>`);
    });

    list.push('</ul>');
    return list.join('');
  }

  #renderSub(el) {
    const name = GSAttr.get(el, 'name');
    return `<li><a class="dropdown-item dropdown-toggle" href="#"><div class="d-inline-block w-100">${name}</div></a>`;
  }

  #renderChild(el) {
    const header = GSAttr.get(el, 'header');
    if (header) return `<li><h6 class="dropdown-header"/>${header}</h6></li>`;
    if (!el.name) return `<li><hr class="dropdown-divider"/></li>`;
    if (el.action) return `<li><a class="dropdown-item" href="#" data-action="${el.action}">${el.name}</a></li>`;
    if (el.toggle) return `<li><a class="dropdown-item" href="#" data-bs-toggle="${el.toggle}" data-bs-target="${el.target}">${el.name}</a></li>`;
    if (el.inject) return `<li><a class="dropdown-item" href="#" data-inject="${el.inject}" data-bs-target="${el.target}">${el.name}</a></li>`;
    if (el.href) return `<li><a class="dropdown-item" href="${el.href}" target="${el.target}">${el.name}</a></li>`;
    const attrs = GSItem.getAttrs(el).trim();
    return attrs ? `<li><a class="dropdown-item" href="#" ${attrs} >${el.name}</a></li>` : '';
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
    GSEvent.deattachListeners(me);
    const src = GSDOM.fromJsonAsString(data);
    GSDOM.setHTML(me, src);
    me.connectedCallback();
    return data;
  }

}

