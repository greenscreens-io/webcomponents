/*
 * © Green Screens Ltd., 2016. - 2022.
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

  static {
    customElements.define('gs-notification', GSNotification);
  }

  async getTemplate(val = '') {
    const me = this;
    return `<div class="toast-container ${me.css}" style="z-index: 10000;">
      <slot name="content"></slot>
    </div>`;
  }

  get css() {
    return GSUtil.getAttribute(this, 'css', 'position-fixed bottom-0 end-0 p-3');
  }

  set css( val = '') {
    GSUtil.setAttribute(this, 'css', val);
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

  show(title = '', message = '', css='', closable = false, timeout = 2) {
    const me = this;
    const tpl = `<gs-toast slot="content" css="${css}"  closable="${closable}" timeout="${timeout}" message="${message}" title="${title}"></gs-toast>`;
    const el = GSUtil.parse(tpl);
    me.appendChild(el);
  }

}
