/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSMenu class
 * @module components/GSMenu
 */

import GSUtil from "../base/GSUtil.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSUListExt from "./ext/GSUListExt.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSItem from "../base/GSItem.mjs";
import GSCSSMap from "../base/GSCSSMap.mjs";

/**
 * Context menu
 *
 * @class
 * @extends {HTMLUListElement}
 */
export default class GSMenu extends GSUListExt {

  #caller = null;

  static {
    customElements.define('gs-menu', GSMenu, { extends: 'ul' });
    Object.seal(GSMenu);
  }

  constructor() {
    super();
    const me = this;
    GSDOM.validate(me, me.tagName, 'LI');
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;    
    me.#attachMenuItems();
    me.#attachSubMenu();
    me.#updatePos();
    me.attachEvent(document, 'keydown', me.#onKeyDown.bind(me));
  }

  disconnectedCallback() {
    const me = this;
    GSEvents.deattachListeners(me);
    super.disconnectedCallback();
  }

	/**
	* Generic event listener appender
	* 
	* @param {HTMLElement} el Element on which to monitor for named events
	* @param {string} name Event name to watch for
	* @param {Function} fn Event trigger callback
	* @param {boolean} once Listen only once
	* @returns {boolean} State if attachment was successful
	*/
	attachEvent(el, name = '', fn, once = false) {
		return GSEvents.attach(this, el, name, fn, once);
	}

	/**
	* Generic event listener remove
	* @param {HTMLElement} el Element on which to monitor for named events
	* @param {string} name Event name to watch for
	* @param {Function} fn Event trigger callback
	* @returns {boolean} State if attachment was successful	
	*/
	removeEvent(el, name = '', fn) {
		return GSEvents.remove(this, el, name, fn);
	}

  /**
   * Check if menu visible 
   */
  get visible() {
    return this.matches('.show');
  }

  /**
   * Check if menu is submenu
   */
  get isSubmenu() {
    return this.matches('.submenu');
  }

  /**
   * Check if menu is closable 
   */
  get closable() {
    const me = this;
    return GSUtil.asBool(me.dataset.closable) || me.isSubmenu;
  }
  
  /**
   * Show at x/y position on the screen
   * @param {number} x 
   * @param {number} y 
   * @param {HTMLElement} caller
   * @returns {void}
   */
  popup(x = 0, y = 0, caller) {
    const me = this;
    const cfg = {clientX: x.clientX || x, clientY: x.clientY || y, target: x.target || caller };
    requestAnimationFrame(() => {
      me.style.position = 'fixed';
      me.style.top = '0px';
      me.style.left = '0px';
      me.style.transform = `translate(${cfg.clientX}px, ${cfg.clientY}px)`;
      me.open(cfg);
    });

  }

  close(e) {
    GSEvents.prevent(e);
    const me = this;
    if (!me.closable) return false;
    me.#closeSubmenus();
    GSDOM.toggleClass(me, 'show', false);
    me.style.left = '';
    me.style.top = '';
    me.#caller?.focus();
    me.#caller = null;
  }

  open(e) {
    const me = this;
    me.#caller = e?.target;
    GSDOM.toggleClass(me, 'show', true);
    me.#updatePos();
    me.#updateSubmenus(e);
    GSDOM.query(me, 'a,input,[tabindex="0"]')?.focus();
  }

  toggle(e) {
    const me = this;
    me.visible ? me.close(e) : me.open(e);
  }

  get #items() {
    return GSDOM.queryAll(this, '.dropdown-item');
  }

  get #submenus() {
    return GSDOM.queryAll(this, '.submenu');
  }

  #closeSubmenus() {
    this.#submenus.forEach(el => GSDOM.toggleClass(el, 'show', false));
  }

  #updatePos() {
    const me = this;
    const rect = me.getBoundingClientRect();
    if (!rect) return;
    const w = rect.width;
    const l = rect.left;
    const ww = parseInt(window.innerWidth, 10);

    const t = rect.top;
    const h = rect.height;
    const wh = parseInt(window.innerHeight, 10);
    const tt = me.#transform;
    requestAnimationFrame(() => {
      if (l + w > ww) {
        let left = l - ((l + w) - ww);
        if (tt) left = left - tt.x.value;
        me.style.left = `${left}px`;
      }
      if (t + h > wh) {
        let top = t - ((t + h) - wh);
        if (tt) top = top - tt.y.value;
        me.style.top = `${top}px`;      
      }

    });
  }

  get #transform() {
    if (!globalThis.CSSTranslate) return null;
    return Array.from(GSCSSMap.styleValue(this, 'transform')).filter(v => v instanceof CSSTranslate).pop();
  }

  #updateSubmenus(e) {
    const me = this;

    requestAnimationFrame(() => {
      const rect = me.getBoundingClientRect();
      if (!rect) return;
      let x = e?.clientX || rect.left, y = e?.clientY || rect.top;
      const overflowH = x + rect.width + 5 > window.innerWidth;
      const overflowV = y + rect.height + 5 > window.innerHeight;
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
        el.dataset.end = end;
        el.dataset.start = !end;
        GSDOM.toggleClass(me, 'dropstart', !end);
        GSDOM.toggleClass(me, 'dropend', end);
      });
    });
  }

  #attachMenuItems() {
    const me = this;
    me.#items.filter(btn => btn.dataset.action)
      .forEach(btn => me.attachEvent(btn, 'click', me.#onClick.bind(me)));
  }

  #attachSubMenu() {
    const me = this;
    if (me.isSubmenu) return;
    me.#items.forEach(el => me.attachEvent(el, 'mouseover', me.#onSubmenu.bind(me)));
    me.attachEvent(me, 'mouseleave', me.close.bind(me));
  }

  #onKeyDown(e) {
    const me = this;
    switch (e.key) {
      //case 'ContextMenu' : return me.#onPopup(e);
      case 'Escape' : 
        GSEvents.prevent(e);
        me.close();
        break;
    }
  }

  async #onClick(e) {
    const me = this;
    GSEvents.prevent(e);
    me.close();
    me.#closeSubmenus();
    me.#handleGroup(e);
    const data = e.target.dataset;
    const opt = { type: 'menu', option: e.target, caller: me.#caller, data: data };
    GSEvents.send(me, 'action', opt, true, true, true); // notify self
  }

  #handleGroup(e) {
    const eli = e?.target?.previousSibling;
    if (!(eli instanceof HTMLInputElement)) return;
    const me = this;
    GSDOM.queryAll(me, `input[name="${eli.name}"]`).forEach(el => el.checked = false);
    eli.checked = true;
  }

  /**
   * Show submenu on mouse over
   * @param {Event} e 
   * @returns {void}
   */
  #onSubmenu(e) {   
    GSEvents.prevent(e);
    const li = GSDOM.closest(e.target, 'li');
    const ul = GSDOM.closest(li, 'ul');
    const sub = GSDOM.query(li, '.submenu');
    requestAnimationFrame(() => {
      GSDOM.queryAll(ul, '.submenu').forEach(el => GSDOM.toggleClass(el,'show', false));
      if (sub) {
        sub.style.top = `${sub.parentElement.offsetTop}px`;
        GSDOM.toggleClass(sub, 'show', true);
      }
    });
  }

  /**
   * Generate menu items from JSON array
   * @param {*} items 
   * @param {*} css 
   * @returns 
   */
  static fromJSON(items = [], css) {
    const me = GSMenu;
    const opts = [];
    items.forEach(it => {
      if (it === '-') return opts.push('<li><hr class="dropdown-divider"/></li>');
      const hasSubmenu = Array.isArray(it.menu);
      opts.push('<li>');
      opts.push(`<a class="dropdown-item" href="#" `);
      //opts.push(GSItem.getAttrs(el));
      opts.push('>');
      opts.push(`${it.name} ${hasSubmenu ? '&raquo;' : ''}`);
      opts.push('</a>');

      if (hasSubmenu) {
        const sub = GSMenu.fromJSON(it.menu, css);
        opts.push(`<ul is="gs-ext-ul" class="submenu dropdown-menu ${css}">`);
        opts.push(sub.join('\n'));
        opts.push('</ul>');
      }
      opts.push('</li>');

    });
    return opts;
  }  

  static fromDOM(children, level = 0, css = '', closable = false) {
    
    const me = GSMenu;
    const list = [];

    const sub = level === 0 ? 'dropend position-fixed' : 'submenu';
    const is = level === 0 ? 'gs-menu' : 'gs-ext-ul';
    list.push(`<ul is="${is}" data-closable="${closable}" class="${sub} dropdown-menu ${css}">`);

    Array.from(children).forEach(el => {
      const isSub = el.childElementCount > 0;
      if (isSub) list.push(me.#renderSub(el));
      const html = isSub ? me.fromDOM(el.children, ++level, css, closable) : me.#renderChild(el);
      list.push(html);
      if (sub) list.push(`</li>`);
    });

    list.push('</ul>');
    return list.join('');
  }

  static #renderSub(el) {
    const name = GSAttr.get(el, 'name');
    return `<li><a class="dropdown-item dropdown-toggle" href="#"><div class="d-inline-block w-100">${name}</div></a>`;
  }

  static #renderChild(el) {
    const header = GSAttr.get(el, 'header');
    if (header) return `<li data-inert="true"><h6 class="dropdown-header"/>${header}</h6></li>`;
    if (!el.name) return `<li data-inert="true"><hr class="dropdown-divider"/></li>`;
    if (el.action) return `<li><a class="dropdown-item" href="#" data-action="${el.action}">${el.html}</a></li>`;
    if (el.toggle) return `<li><a class="dropdown-item" href="#" data-bs-toggle="${el.toggle}" data-bs-target="${el.target}">${el.name}</a></li>`;
    if (el.inject) return `<li><a class="dropdown-item" href="#" data-inject="${el.inject}" data-bs-target="${el.target}">${el.name}</a></li>`;
    if (el.href) return `<li><a class="dropdown-item" href="${el.href}" target="${el.target}">${el.name}</a></li>`;
    const attrs = GSItem.getAttrs(el).trim();
    return attrs ? `<li><a class="dropdown-item" href="#" ${attrs} >${el.name}</a></li>` : '';
  }


}

