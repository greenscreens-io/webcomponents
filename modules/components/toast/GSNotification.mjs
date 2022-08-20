/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSNotification class
 * @module components/toast/GSNotification
 */

import GSElement from "../../base/GSElement.mjs";
import GSUtil from "../../base/GSUtil.mjs";

/**
 * Notification container responsible to show toasts
 * @class
 * @extends {GSElement}
 */
export default class GSNotification extends GSElement {

  static TOP_START = "position-fixed top-0 start-0";
  static TOP_CENTER ="position-fixed top-0 start-50 translate-middle-x";
  static TOP_END = "position-fixed top-0 end-0";
  static MIDDLE_START = "position-fixed top-50 start-0 translate-middle-y";
  static MIDDLE_CENTER = "position-fixed top-50 start-50 translate-middle";
  static MIDDLE_END = "position-fixed top-50 end-0 translate-middle-y";
  static BOTTOM_START = "position-fixed bottom-0 start-0";
  static BOTTOM_CENTER ="position-fixed bottom-0 start-50 translate-middle-x";
  static BOTTOM_END = "position-fixed bottom-0 end-0";

  static DEFAULT = GSNotification.BOTTOM_END;

  static {
    customElements.define('gs-notification', GSNotification);
  }

  static get observedAttributes() {
    const attrs = ['position'];
    return GSUtil.mergeArrays(attrs, super.observedAttributes);
  }

  attributeCallback(name = '', oldVal = '', newVal = '') {
    const me = this;

    oldVal = me.#fromPosition(oldVal);
    newVal = me.#fromPosition(newVal);

    const wrapEl = me.findEl('div');
    GSUtil.toggleClass(wrapEl, false, oldVal);
    GSUtil.toggleClass(wrapEl, true, newVal);
  }

  #fromPosition(val) {
    let css = GSNotification[val];
    return GSUtil.isString(css) && css.startsWith('position-') ? css : val;
  }

  async getTemplate(val = '') {
    const me = this;
    return `<div class="toast-container ${me.css} ${me.position}" style="z-index: 10000;">
      <slot name="content"></slot>
    </div>`;
  }

  get css() {
    return GSUtil.getAttribute(this, 'css', 'p-3');
  }

  set css(val = '') {
    GSUtil.setAttribute(this, 'css', val);
  }

  get position() {
    return GSUtil.getAttribute(this, 'position', GSNotification.DEFAULT);
  }

  set position(val = '') {
    GSUtil.setAttribute(this, 'position', val);
  }

  info(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-info', closable, timeout);
  }

  success(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-success', closable, timeout);
  }

  warn(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-warning', closable, timeout);
  }

  danger(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-danger', closable, timeout);
  }

  primary(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-primary', closable, timeout);
  }

  secondary(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-secondary', closable, timeout);
  }

  dark(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-dark', closable, timeout);
  }

  light(title = '', message = '', closable = false, timeout = 2) {
    this.show(title, message, 'bg-light', closable, timeout);
  }

  show(title = '', message = '', css = '', closable = false, timeout = 2) {
    const me = this;
    const tpl = `<gs-toast slot="content" css="${css}"  closable="${closable}" timeout="${timeout}" message="${message}" title="${title}"></gs-toast>`;
    const el = GSUtil.parse(tpl);
    me.appendChild(el);
  }

  clear() {
    Array.from(this.querySelectorAll('gs-toast')).forEach(el => el.remove());
  }

}
