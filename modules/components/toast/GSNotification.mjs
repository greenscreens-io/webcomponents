/*
 * Copyright (C) 2015, 2027 Green Screens Ltd.
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
  #webToasts = new Set();
  #clearGeneration = 0;

  static get observedAttributes() {
    const attrs = ['position', 'css'];
    return GSElement.observeAttributes(attrs);
  }

  async onBeforeReady() {
    await super.onBeforeReady();
    GSDOM.toggleClass(this.query('.toast-container'), `${this.css} ${this.position}`, true);
  }

  attributeCallback(name = '', oldVal = '', newVal = '') {
    const me = this;
    if (name === 'position') {
      oldVal = me.#fromPosition(oldVal);
      newVal = me.#fromPosition(newVal);
    } else if (name !== 'css') {
      return;
    }

    const el = me.query('.toast-container');
    GSDOM.toggleClass(el, oldVal, false);
    GSDOM.toggleClass(el, newVal, true);
  }

  #fromPosition(val) {
    let css = GSNotification[val];
    return GSUtil.isString(css) && css.startsWith('position-') ? css : val;
  }

  async getTemplate(val = '') {
    return `<div class="toast-container z-10k">
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
    return this.hasAttribute('native');
  }

  set native(val = '') {
    GSAttr.toggle(this, 'native', val);
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
    const generation = me.#clearGeneration;
    if (me.native) {
      let sts = await GSNotification.requestPermission();
      if (generation !== me.#clearGeneration) return;
      if (sts) sts = await me.#showNative(title, message, timeout, delay, options, generation);
      if (sts) return sts;
    }
    if (generation !== me.#clearGeneration) return;
    return me.#showWeb(title, message, css, closable, timeout, delay, generation);
  }

  #showWeb(title, message, css, closable, timeout, delay, generation) {
    const me = this;
    const el = document.createElement('gs-toast');
    el.setAttribute('slot', 'content');
    GSAttr.set(el, 'css', css);
    GSAttr.toggle(el, 'closable', GSUtil.asBool(closable));
    GSAttr.toggle(el, 'visible', true);
    GSAttr.set(el, 'delay', delay);
    GSAttr.set(el, 'timeout', timeout);
    GSAttr.set(el, 'message', message);
    GSAttr.set(el, 'title', title);
    me.#webToasts.add(el);
    el.addEventListener('dismissed', () => me.#webToasts.delete(el), { once: true });
    requestAnimationFrame(async () => {
      await me.#delay(delay);
      if (generation !== me.#clearGeneration || !me.#webToasts.has(el)) return;
      const toast = me.#dialogToast;
      if (toast !== me) GSAttr.set(toast, 'class', `toast-container ${me.css} ${me.position}`);
      toast.appendChild(el);
    });
    return el;
  }

  async #showNative(title, message, timeout, delay, options = {}, generation) {
    const me = this;
    await me.#delay(delay);
    if (generation !== me.#clearGeneration) return;
    options ??= {};
    const notification = new Notification(title, {
      requireInteraction: true,
      ...options,
      body: options.body || message
    });
    me.#list.add(notification);
    const callback = () => {
      if (notification.iid) clearTimeout(notification.iid);
      notification.removeEventListener('close', callback);
      me.removeNative(notification);
    };
    notification.addEventListener('close', callback, { once: true });
    if (timeout > 0) notification.iid = setTimeout(() => notification.close(), timeout * 1000);
    return notification;
  }

  get #dialogToast() {
    const dlg = customElements.get('gs-dialog')?.top;
    return dlg && dlg.isConnected ? (GSDOM.query(dlg, '.toast-container') || this) : this;
  }

  async #delay(delay = 0) {
    if (GSUtil.isNumber(delay) && delay > 0 ) await GSUtil.timeout(delay * 1000);
  }

  removeNative(notification) {
    this.#list.delete(notification);
  }

  /**
   * Clear all triggered notifications
   */
  clear() {
    const me = this;
    me.#clearGeneration++;
    me.#webToasts.forEach(toast => toast.remove());
    me.#webToasts.clear();
    me.#list.forEach(nn => nn.close());
    me.#list.clear();
  }

  /**
   * Check if native notification is supported
   * @returns {boolean} 
   */
  static get isNativeSupported() {
    return "Notification" in globalThis;
  }

  /**
   * Check if native notification is allowed
   * @returns {boolean} 
   */
  static get isGranted() {
    return GSNotification.isNativeSupported && Notification.permission === "granted";
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
