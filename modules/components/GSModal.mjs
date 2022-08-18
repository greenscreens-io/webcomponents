/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSModal class
 * @module components/GSModal
 */

import GSElement from "../base/GSElement.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
export default class GSModal extends GSElement {

  static #actions = ['ok', 'cancel'];

  static {
    customElements.define('gs-modal', GSModal);
  }

  static get observedAttributes() {
    const attrs = ['cancelable', 'closable', 'title', 'visible'];
    return GSUtil.mergeArrays(attrs, super.observedAttributes);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update();
    if (name === 'visible') {
      if (me.visible) {
        me.#showEL('.modal');
        me.#showEL('.modal-backdrop');
        me.focusable().focus();
      } else {
        me.#hideEL('.modal');
        me.#hideEL('.modal-backdrop');
        me.normal();
      }
      GSUtil.sendEvent(me, 'visible', { type: 'modal', ok: me.visible }, true, true);
    }
  }

  onReady() {
    const me = this;
    me.attachEvent(me, 'click', me.#onClick.bind(me));
    me.attachEvent(me, 'form', me.#onForm.bind(me));
    me.attachEvent(me, 'modal', me.#onModal.bind(me));
    super.onReady();
    if (me.visible) me.open();
  }

  #onModal(e) {
    const me = this;
    const sts = me.#validateCaller(e, e.target, 'close', 'GS-MODAL');
    if (!sts) return;
    GSUtil.preventEvent(e);
     me.close();
  }

  #onForm(e) {
    const me = this;
    let sts = me.#validateCaller(e, e.target, 'submit', 'GS-MODAL');
    if (!sts) return;
    GSUtil.preventEvent(e);
    sts = GSUtil.sendEvent(me, 'data', { type: 'modal', data: e.detail.data, evt: e }, true, true, true);
    if (sts) me.close();
  }

  #validateCaller(e, own, type, comp) {
    if (e.detail.type !== type) return false;
    const parent = GSComponents.getOwner(own, comp);
    return parent == this;
  }

  #onClick(e) {
    const me = this;
    let sts = true;
    try {
      const action = GSUtil.getAttribute(e.path[0], 'data-action');
      if (GSModal.#actions.indexOf(action) < 0) return sts = false;
      GSUtil.preventEvent(e);
      const isOk = action === 'ok';
      sts = GSUtil.sendEvent(me, 'action', { type: 'modal', ok: isOk, evt: e }, true, true, true);
    } finally {
      if (sts) me.close();
    }
  }

  #setSize(size = '') {
    const me = this;
    const dlg = me.findEl('.modal-dialog');
    if (!dlg) return;
    requestAnimationFrame(() => {
      dlg.classList.remove('modal-xl', 'modal-lg');
      if (size) dlg.classList.add(size);
    });
  }

  /**
   * Change size of modal window to "large"
   */
  large() {
    this.#setSize('modal-lg');
  }

  /**
   * Change size of modal window to "extra large"
   */
  extra() {
    this.#setSize('modal-xl');
  }

  /**
   * Change size of modal window to "default"
   */
  normal() {
    this.#setSize();
  }

  /**
   * Generic modal popup function
   * @param {string} title Modal title
   * @param {string} message Modal message 
   * @param {boolean} closable Can user close it (close button)
   * @param {boolean} cancelable Is cancel button available
   * @returns {Promise}
   */
  info(title = '', message = '', closable = false, cancelable = false) {
    const me = this;
    me.title = title;
    me.body = message;
    me.cancelable = cancelable;
    me.closable = closable;
    me.open();
    if (closable || cancelable) return me.waitEvent('action');
  }

  confirm(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, false);
  }

  prompt(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, true);
  }

  /**
   * Show modal panel
   */
  open(e) {
    GSUtil.preventEvent(e);
    const me = this;
    const sts = GSUtil.sendEvent(me, 'open', { type: 'modal' }, true, true, true);
    if (sts) me.visible = true;
  }

  /**
   * Hide modal panel
   */
  close(e) {
    GSUtil.preventEvent(e);
    const me = this;
    const sts = GSUtil.sendEvent(me, 'close', { type: 'modal' }, true, true, true);
    if (sts) me.visible = false;
  }

  /**
   * Toggle modal panel
   */
  toggle() {
    const me = this;
    me.visible = !me.visible;
  }

  /**
   * Return active button
   * @returns {HTMLButtonElement|GSButton}
   */
  focusable() {
    const me = this;
    if (me.cancelable) return me.#buttonCancelEl;
    if (me.closable) return me.#buttonOkEl;
    return me;
  }

  get #buttonOkEl() {
    return this.findEl('.modal-ok');
  }

  get #buttonCancelEl() {
    return this.findEl('.modal-cancel');
  }

  #showEL(name) {
    const el = this.findEl(name);
    if (!el) return;
    el.classList.remove('d-none');
    el.classList.add('show', 'd-block');
  }

  #hideEL(name) {
    const el = this.findEl(name);
    if (!el) return;
    el.classList.add('d-none');
    el.classList.remove('show', 'd-block');
  }

  #update() {
    const me = this;
    GSUtil.toggleClass(me.#buttonOkEl, !me.closable);
    GSUtil.toggleClass(me.#buttonCancelEl, !me.cancelable);
    const css = `justify-content-${me.align}`;
    const footer = me.findEl('.modal-footer');
    GSUtil.toggleClass(footer, true, css);
  }

  get title() {
    return GSUtil.findSlotOrEl(this, 'title', '.modal-title');
  }

  set title(val = '') {
    this.title.innerHTML = val;
  }

  get body() {
    return GSUtil.findSlotOrEl(this, 'body', '.modal-body');
  }

  set body(val = '') {
    this.body.innerHTML = val;
  }

  get visible() {
    return GSUtil.getAttributeAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSUtil.setAttribute(this, 'visible', val == true);
  }

  get closable() {
    return GSUtil.getAttributeAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSUtil.setAttribute(this, 'closable', val == true);
    this.#update();
  }

  get cancelable() {
    return GSUtil.getAttributeAsBool(this, 'cancelable', true);
  }

  set cancelable(val = true) {
    GSUtil.setAttribute(this, 'cancelable', val == true);
    this.#update();
  }

  /**
   * Align buttons start | end | center
   */
  get align() {
    return GSUtil.getAttribute(this, 'align', 'end');
  }

  set align(val = 'end') {
    GSUtil.setAttribute(this, 'align', val);
    this.#update();
  }

  get buttonOk() {
    return GSUtil.getAttribute(this, "button-ok", "Ok");
  }

  set buttonOk(val = 'Ok') {
    GSUtil.setAttribute(this, "button-ok", val);
  }

  get buttonCancel() {
    return GSUtil.getAttribute(this, "button-cancel", "Cancel");
  }

  set buttonCancel(val = 'Cancel') {
    GSUtil.setAttribute(this, "button-cancel", val);
  }

  get cssButtonOk() {
    return GSUtil.getAttribute(this, "css-button-ok", "btn-primary");
  }

  get cssButtonCancel() {
    return GSUtil.getAttribute(this, "css-button-cancel", "btn-secondary");
  }

  async getTemplate(val = '') {
    if (val) return super.getTemplate(val || '//modal.tpl');
    const me = this;
    return `
        <div class="modal d-none fade">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <div class="modal-title">
                <slot name="title"></slot>
              </div>
            </div>
            <div class="modal-body">
              <slot name="body"></slot>
            </div>
            <div class="modal-footer border-0 justify-content-${me.align}">
              <button class="btn ${me.cssButtonCancel} modal-cancel" data-action="cancel">${me.buttonCancel}</button>
              <button class="btn ${me.cssButtonOk} modal-ok" data-action="ok">${me.buttonOk}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop d-none fade "></div>    
    `
  }
}

