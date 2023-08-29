/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSNotification class
 * @module components/toast/GSNotification
 */

import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSUtil from "../../base/GSUtil.mjs";

/**
 * Notification container responsible to show toasts
 * @class
 * @extends {GSElement}
 */
export default class GSNotification extends GSElement {

  static TOP_START = "position-fixed top-0 start-0";
  static TOP_CENTER = "position-fixed top-0 start-50 translate-middle-x";
  static TOP_END = "position-fixed top-0 end-0";
  static MIDDLE_START = "position-fixed top-50 start-0 translate-middle-y";
  static MIDDLE_CENTER = "position-fixed top-50 start-50 translate-middle";
  static MIDDLE_END = "position-fixed top-50 end-0 translate-middle-y";
  static BOTTOM_START = "position-fixed bottom-0 start-0";
  static BOTTOM_CENTER = "position-fixed bottom-0 start-50 translate-middle-x";
  static BOTTOM_END = "position-fixed bottom-0 end-0";

  static DEFAULT = GSNotification.BOTTOM_END;

  #list = new Set();

  static get observedAttributes() {
    const attrs = ['position'];
    return GSElement.observeAttributes(attrs);
  }

  connectCallback() {
    super.connectedCallback();
  }

  disconnectCallback() {
    super.disconnectedCallback();
    this.#list = null;
  }

  attributeCallback(name = '', oldVal = '', newVal = '') {
    const me = this;

    oldVal = me.#fromPosition(oldVal);
    newVal = me.#fromPosition(newVal);

    const el = me.query('div');
    GSDOM.toggleClass(el, oldVal, false);
    GSDOM.toggleClass(el, newVal, true);
  }

  #fromPosition(val) {
    let css = GSNotification[val];
    return GSUtil.isString(css) && css.startsWith('position-') ? css : val;
  }

  async getTemplate(val = '') {
    const me = this;
    return `<div class="toast-container z-10k ${me.css} ${me.position}">
    <slot name="content"></slot>
    </div>`;
  }

  /**
   * Generic css for notifiction container
   */
  get css() {
    return GSAttr.get(this, 'css', 'p-3');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  /**
   * Position where to show notification
   * NOTE: Might interfer with "css" attribute
   */
  get position() {
    const val = GSAttr.get(this, 'position', GSNotification.DEFAULT);
    return val.indexOf('_') > 0 && GSNotification[val] ? GSNotification[val] : val;
  }

  set position(val = '') {
    GSAttr.set(this, 'position', val);
  }

  /**
   * Set browser native notification usage
   */
  get native() {
    return GSAttr.getAsBool(this, 'native', false);
  }

  set native(val = '') {
    GSAttr.setAsBool(this, 'native', val);
  }

  info(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-info', closable, timeout, delay, options);
  }

  success(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-success', closable, timeout, delay, options);
  }

  warn(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-warning', closable, timeout, delay, options);
  }

  danger(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-danger', closable, timeout, delay, options);
  }

  primary(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-primary', closable, timeout, delay, options);
  }

  secondary(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-secondary', closable, timeout, delay, options);
  }

  dark(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-dark', closable, timeout, delay, options);
  }

  light(title, message, closable, timeout, delay, options) {
    return this.display(title, message, 'text-bg-light', closable, timeout, delay, options);
  }

  /**
   * Main function to show notification. 
   * It has support for Bootstrap based and web based notifications.
   * 
   * @async
   * @param {string} title Notification title
   * @param {string} message Notification message
   * @param {string} css CSS styling (web only)
   * @param {boolean} closable Can user close it (web only)
   * @param {number} timeout Timeout after which to close notification  (default 2 sec)
   * @param {number} delay Timeout after which to show notification (default 1 sec)
   * @param {object} options Options for native Notification
   * @returns {Promise<Notification|GSToast>}
   */
  async display(title = '', message = '', css = '', closable = false, timeout = 2, delay = 0.5, options) {
    if (!message) return;
    const me = this;
    if (me.native) {
      let sts = await GSNotification.requestPermission();
      if (sts) sts = me.#showNative(title, message, timeout, delay, options);
      if (sts) return sts;
    }
    return me.#showWeb(title, message, css, closable, timeout, delay);
  }

  #showWeb(title, message, css, closable, timeout, delay) {
    const me = this;
    const tpl = `<gs-toast slot="content" css="${css}"  closable="${closable}" timeout="${timeout}" message="${message}" title="${title}"></gs-toast>`;
    const el = GSDOM.parse(tpl, true);
    const toast = me.#dialogToast;
    requestAnimationFrame(async () => {
      if (toast !== me) GSAttr.set(toast, 'class', `toast-container ${me.css} ${me.position}`);
      await me.#delay(delay);
      toast.appendChild(el);
    });
    return el;
  }

  async #showNative(title, message, timeout, delay, options = {}) {
    const me = this;
    await me.#delay(delay);
    options.body = options.body || message;
    const notification = new Notification(title, options);
    me.#list.add(notification);
    const callback = me.#clearNative.bind({ notification: notification, owner: me });
    notification.addEventListener('close', callback);
    if (timeout > 0) setTimeout(callback, timeout * 1000);
    return notification;
  }
  
  get #dialogToast() {
    const dlg = customElements.get('gs-dialog')?.top;
    return dlg && dlg.isConnected ? (GSDOM.query(dlg, '.toast-container') || this) : this;
  }

  async #delay(delay = 0) {
    if (delay > 0 && GSUtil.isNumber(delay)) await GSUtil.timeout(delay * 1000);
  }

  #clearNative() {
    const me = this;
    me.notification.close();
    me.owner.#list.delete(me.notification);
  }

  /**
   * Clear all triggered notifications
   */
  clear() {
    const me = this;
    Array.from(me.querySelectorAll('gs-toast')).forEach(el => el.remove());
    me.#list.forEach(nn => nn.close());
    me.#list.clear();
  }

  /**
   * Check if native notification is supported
   * @returns {boolean} 
   */
  static get isNativeSupported() {
    return "Notification" in self;
  }

  /**
   * Check if native notification is allowed
   * @returns {boolean} 
   */
  static get isGranted() {
    return Notification.permission === "granted";
  }

  /**
   * Request useage for browser native notification
   * 
   * @async
   * @returns {Promise<boolean>} Return granted status
   */
  static async requestPermission() {
    if (!GSNotification.isNativeSupported) return false;
    if (!GSNotification.isGranted) await Notification.requestPermission();
    return GSNotification.isGranted;
  }

  static {
    customElements.define('gs-notification', GSNotification);
    Object.seal(GSNotification);
  }

}

