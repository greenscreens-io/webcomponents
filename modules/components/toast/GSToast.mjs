/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSToast class
 * @module components/toast/GSToast
 */


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
  }

  static get observedAttributes() {
    const attrs = ['placement', 'css'];
    return GSUtil.mergeArrays(attrs, super.observedAttributes);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    if (name === 'css') {
      const el = me.findEl('.toast');
      GSUtil.toggleClass(el, false, oldValue);
      GSUtil.toggleClass(el, true, newValue);
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
    const btns = me.findAll('button');
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
      GSUtil.toggleClass(this.#toast, true, 'show');
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
    GSUtil.toggleClass(this.#toast, false, 'show');
    await GSUtil.timeout(GSUtil.SPEED);
    return this.remove();
  }

  get #toast() {
    return this.findEl('.toast');
  }

  /**
   * Prevent shadow dom
   */
  get isFlat() {
    return true;
  }

  get position() {
    return 'self';
  }

  get title() {
    return GSUtil.getAttribute(this, 'title');
  }

  set title(val = '') {
    GSUtil.setAttribute(this, 'title', val);
  }

  get message() {
    return GSUtil.getAttribute(this, 'message');
  }

  set message(val = '') {
    GSUtil.setAttribute(this, 'message', val);
  }

  get css() {
    return GSUtil.getAttribute(this, 'css');
  }

  set css(val = '') {
    GSUtil.setAttribute(this, 'css', val);
  }

  get timeout() {
    return GSUtil.getAttributeAsNum(this, 'timeout', 2);
  }

  set timeout(val = 2) {
    GSUtil.setAttribute(this, 'timeout', val);
  }

  get closable() {
    return GSUtil.getAttributeAsBool(this, 'closable');
  }

  set closable(val = true) {
    GSUtil.setAttribute(this, 'closable', val == true);
  }

  get visible() {
    return GSUtil.getAttributeAsBool(this, 'visible', true);
  }

  set visible(val = true) {
    GSUtil.setAttribute(this, 'visible', val == true);
  }

}
