/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSToast class
 * @module components/toast/GSToast
 */


import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSUtil from "../../base/GSUtil.mjs";

/**
 * Toast popup with self destroy timeout 
 * @class
 * @extends {GSElement}
 */
export default class GSToast extends GSElement {

  static {
    customElements.define('gs-toast', GSToast);
    Object.seal(GSToast);
  }

  static get observedAttributes() {
    const attrs = ['placement', 'css'];
    return GSElement.observeAttributes(attrs);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    if (name === 'css') {
      const el = me.query('.toast');
      GSDOM.toggleClass(el, false, oldValue);
      GSDOM.toggleClass(el, true, newValue);
    }

  }

  async getTemplate(val = '') {
    const me = this;
    const btn = me.closable ? '<button type="button" class="btn-close me-2 m-auto"></button>' : '';
    return `
        <div class="mt-1 mb-1 toast fade ${me.visible ? 'show' : ''} ${me.css}">
          <div class="d-flex">
              <div class="toast-body">
              ${me.message}
              </div>
              ${btn}
          </div>
      </div>    
    `
  }

  onReady() {
    const me = this;
    const btns = me.queryAll('button');
    Array.from(btns).forEach(btn => me.attachEvent(btn, 'click', me.close.bind(me)));
    super.onReady();
    if (me.visible) me.open();
  }

  show(title = '', message = '', css = '', visible = true, closable = false, timeout = 2) {
    const me = this;
    me.css = css || me.css;
    me.title = title;
    me.message = message;
    me.timeout = timeout;
    me.closable = closable == true;
    me.visible = visible == true;
    me.open();
  }

  open() {
    const me = this;
    requestAnimationFrame(async () => {
      GSDOM.toggleClass(this.#toast, true, 'show');
      if (me.timeout <= 0) return;
      await GSUtil.timeout(me.timeout * 1000);
      me.close();
    });
  }

  close() {
    this.#dismiss();
  }

  dismiss() {
    this.#dismiss();
  }

  async #dismiss() {
    GSDOM.toggleClass(this.#toast, false, 'show');
    await GSUtil.timeout(GSDOM.SPEED);
    return this.remove();
  }

  get #toast() {
    return this.query('.toast');
  }

  /**
   * Prevent shadow dom
   */
  get isFlat() {
    return true;
  }

  get title() {
    return GSAttr.get(this, 'title');
  }

  set title(val = '') {
    GSAttr.set(this, 'title', val);
  }

  get message() {
    return GSAttr.get(this, 'message');
  }

  set message(val = '') {
    GSAttr.set(this, 'message', val);
  }

  get css() {
    return GSAttr.get(this, 'css');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  get timeout() {
    return GSAttr.getAsNum(this, 'timeout', 2);
  }

  set timeout(val = 2) {
    GSAttr.set(this, 'timeout', val);
  }

  get closable() {
    return GSAttr.getAsBool(this, 'closable');
  }

  set closable(val = true) {
    GSAttr.set(this, 'closable', val == true);
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible', true);
  }

  set visible(val = true) {
    GSAttr.set(this, 'visible', val == true);
  }

}

