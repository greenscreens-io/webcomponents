/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDialog class
 * @module components/GSDialog
 */

import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSElement from "../base/GSElement.mjs";
import GSEvents from "../base/GSEvents.mjs";

/**
 * Native dialog with Bootstrap support
 * @class
 * @extends {GSElement}
 */
export default class GSDialog extends GSElement {

  static CSS = 'rounded shadow-sm';
  static HEADER_CSS = 'p-3';
  static TITLE_CSS = 'fs-5 fw-bold text-muted';

  static #actions = ['ok', 'cancel'];

  static #STACK = [];

  static {
    customElements.define('gs-dialog', GSDialog);
    Object.seal(GSDialog);
  }

  static get observedAttributes() {
    const attrs = ['cancelable', 'closable', 'title', 'visible'];
    return GSElement.observeAttributes(attrs);
  }

  static get top() {
    return GSDialog.#STACK.length === 0 ? null : GSDialog.#STACK[GSDialog.#STACK.length-1];
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update();
    if (name === 'visible') {
      if (me.visible) {
        if (!me.#dialog.open) {
          me.#dialog.showModal();
          GSDialog.#STACK.push(me);
        }
        me.focusable()?.focus();
      } else {
        me.#dialog.close();
        GSDialog.#STACK.pop();
      }
      GSEvents.send(me, 'visible', { type: 'dialog', ok: me.visible }, true, true);
    }
  }

  onReady() {
    const me = this;
    me.attachEvent(me, 'click', me.#onClick.bind(me));
    me.attachEvent(me, 'action', me.#onClick.bind(me));
    me.attachEvent(me, 'form', me.#onForm.bind(me));
    me.attachEvent(me.#dialog, 'keydown', me.#onEscape.bind(me));
    me.attachEvent(me.#dialog, 'close', me.#onClose.bind(me));
    me.attachEvent(me.#dialog, 'cancel', me.#onCancel.bind(me));
    super.onReady();
    if (me.visible) me.open();
  }

  #onForm(e) {
    const me = this;
    GSEvents.prevent(e);
    const sts = GSEvents.send(me, 'data', { type: 'dialog', data: e.detail.data, evt: e }, true, true, true);
    if (sts) me.close();
  }

  #onEscape(e) {
    const me = this;
    if (!me.cancelable || e.key !== 'Escape') return;
    me.close();
    GSEvents.prevent(e);
  }

  #onClose(e) {
    const me = this;
    me.visible = false;
  }

  #onCancel(e) {
    const me = this;
    me.visible = false;
  }

  #onClick(e) {

    const me = this;
    const action = me.#isAcceptedAction(e);
    if (!action) return;

    const isOk = action === 'ok';
    const forms = GSDOM.queryAll(me, 'form');
    const processForms = isOk && forms.length > 0;

    if (processForms) {
      const invalid = forms.filter(form => form.checkValidity() == false);
      invalid.forEach(form => me.#reportForm(form));
      if (invalid.length === 0) forms.forEach(form => me.#submitForm(form));

      const els = invalid.map(form => GSDOM.queryAll(form, 'textarea, input, select').filter(el => el.checkValidity() == false));
      if (els.length > 0) GSEvents.send(me, 'error', { type: 'dialog', data: els }, true, true, true);
      return;
    }

    let sts = true;
    try {
      sts = GSEvents.send(me, 'action', { type: 'dialog', ok: isOk, evt: e }, true, true, true);
    } finally {
      if (sts) me.close(null, isOk);
    }
  }

  #submitForm(form) {
    try {
      GSEvents.send(form, 'action', { action: 'submit' });
    } catch (e) {
      console.log(e);
    }
  }

  #reportForm(form) {
    try {
      form.reportValidity();
    } catch (e) {
      console.log(e);
    }
  }

  #getAction(e) {
    const el = e.composedPath().shift();
    return el?.dataset?.action || e.detail.action || el?.type;
  }

  #isAcceptedAction(e) {
    const action = this.#getAction(e);
    const isOk = GSDialog.#actions.includes(action);
    if (isOk) GSEvents.prevent(e);
    return isOk ? action : null;
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
    GSEvents.prevent(e);
    const me = this;
    const sts = GSEvents.send(me, 'open', { type: 'dialog' }, true, true, true);
    if (sts) me.visible = true;
  }

  /**
   * Hide modal panel
   */
  close(e, ok = false) {
    GSEvents.prevent(e);
    const me = this;
    const sts = GSEvents.send(me, 'close', { type: 'dialog', isOk: ok }, true, true, true);
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
    const form = me.queryAll(GSDOM.QUERY_INPUT, true).filter(el => GSDOM.isVisible(el)).shift();
    if (form) return form;
    if (me.cancelable) return me.#buttonCancelEl;
    if (me.closable) return me.#buttonOkEl;
    return me;
  }

  get #buttonOkEl() {
    return this.query('.dialog-ok');
  }

  get #buttonCancelEl() {
    return this.query('.dialog-cancel');
  }

  #update() {
    const me = this;
    GSDOM.toggle(me.#buttonOkEl, me.closable);
    GSDOM.toggle(me.#buttonCancelEl, me.cancelable);
    const css = `justify-content-${me.align}`;
    const footer = me.query('.card-footer');
    GSDOM.toggleClass(footer, css, true);
  }

  /**
   * Search for named slot tag or css selector 
   * @param {string} name Tagged slot  name
   * @param {*} qry CSS selector
   * @returns {HTMLElement|Array<HTMLElement>}
   */
  #findSlotOrEl(name = '', qry = '') {
    const me = this;
    let el = name ? me.self.querySelector(`slot[name="${name}"]`) : null;
    if (!el) el = me.self.querySelector(qry);
    return el;
  }

  /**
   * N/A - compatibiltiy with gs-modal
   */
  large() {

  }

  /**
   * N/A - compatibiltiy with gs-modal
   */  
  extra() {
    
  }

  get #dialog() {
    return this.query('dialog');
  }

  get title() {
    //return this.#findSlotOrEl('title', '.card-title');
    //return this.query('.card-title');
    return this.query('slot[name="title"]');
  }

  set title(val = '') {
    GSDOM.setHTML(this.title, val);
  }

  get body() {
    //return this.#findSlotOrEl('body', '.card-body');
    return this.query('.card-body');
  }

  set body(val = '') {
    GSDOM.setHTML(this.body, val);
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSAttr.setAsBool(this, 'visible', val);
  }

  get closable() {
    return GSAttr.getAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSAttr.setAsBool(this, 'closable', val);
    this.#update();
  }

  get cancelable() {
    return GSAttr.getAsBool(this, 'cancelable', true);
  }

  set cancelable(val = true) {
    GSAttr.setAsBool(this, 'cancelable', val);
    this.#update();
  }

  /**
   * Align buttons start | end | center
   */
  get align() {
    return GSAttr.get(this, 'button-align', 'end');
  }

  set align(val = 'end') {
    GSAttr.set(this, 'button-align', val);
    this.#update();
  }

  get buttonOk() {
    return GSAttr.get(this, "button-ok", "Ok");
  }

  set buttonOk(val = 'Ok') {
    GSAttr.set(this, "button-ok", val);
  }

  get buttonCancel() {
    return GSAttr.get(this, "button-cancel", "Cancel");
  }

  set buttonCancel(val = 'Cancel') {
    GSAttr.set(this, "button-cancel", val);
  }

  get cssButtonOk() {
    return GSAttr.get(this, "css-button-ok", "btn-primary");
  }

  get cssButtonCancel() {
    return GSAttr.get(this, "css-button-cancel", "btn-secondary");
  }

  get css() {
    return GSAttr.get(this, "css", GSDialog.CSS);
  }

  get cssContent() {
    return GSAttr.get(this, "css-content", "");
  }

  get cssHeader() {
    return GSAttr.get(this, "css-header", GSDialog.HEADER_CSS);
  }

  get cssTitle() {
    return GSAttr.get(this, "css-title", GSDialog.TITLE_CSS);
  }

  get cssBody() {
    return GSAttr.get(this, "css-body", "p-0");
  }

  get cssFooter() {
    return GSAttr.get(this, "css-footer", "");
  }

  set css(val = '') {
    return GSAttr.set(this, "css", val);
  }

  set cssContent(val = '') {
    return GSAttr.set(this, "css-content", val);
  }

  set cssHeader(val = '') {
    return GSAttr.set(this, "css-header", val);
  }

  set cssTitle(val = '') {
    return GSAttr.set(this, "css-title", val);
  }

  set cssBody(val = '') {
    return GSAttr.set(this, "css-body", val);
  }

  set cssFooter(val = '') {
    return GSAttr.set(this, "css-footer", val);
  }

  // css, css-content css-header css-title css-body css-footer
  async getTemplate(val = '') {
    if (val) return super.getTemplate(val);
    const me = this;
    return `
        <dialog class="dialog p-0 border-0 ${me.css}">
        <div class="card">
            <div class="card-header user-select-none ${me.cssHeader}">
              <div class="card-title ${me.cssTitle}">
                <slot name="title"></slot>
              </div>
            </div>
            <div class="card-body ${me.cssBody}">
              <slot name="body"></slot>
            </div>
            <div class="card-footer d-flex user-select-none justify-content-${me.align} ${me.cssFooter}">
              <button class="btn ${me.cssButtonCancel} dialog-cancel" data-action="cancel">${me.buttonCancel}</button>
              &nbsp;
              <button class="btn ${me.cssButtonOk} dialog-ok" data-action="ok">${me.buttonOk}</button>
            </div>
        </div>
        <slot name="extra"></slot>
        <div class="toast-container position-fixed"></slot></div>        
        </dialog>
     `
  }
}
