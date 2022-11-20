/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSModal class
 * @module components/GSModal
 */

import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSElement from "../base/GSElement.mjs";
import GSEvent from "../base/GSEvent.mjs";

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
export default class GSModal extends GSElement {

  static #actions = ['ok', 'cancel'];

  static {
    customElements.define('gs-modal', GSModal);
    Object.seal(GSModal);
  }

  static get observedAttributes() {
    const attrs = ['cancelable', 'closable', 'title', 'visible'];
    return GSElement.observeAttributes(attrs);
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
      GSEvent.send(me, 'visible', { type: 'modal', ok: me.visible }, true, true);
    }
  }

  onReady() {
    const me = this;
    me.attachEvent(me, 'click', me.#onClick.bind(me));
    me.attachEvent(me, 'action', me.#onClick.bind(me));
    me.attachEvent(me, 'form', me.#onForm.bind(me));
    me.attachEvent(document, 'keyup', me.#onEscape.bind(me));
    super.onReady();
    if (me.visible) me.open();
  }

  #onForm(e) {
    const me = this;
    GSEvent.prevent(e);
    const sts = GSEvent.send(me, 'data', { type: 'modal', data: e.detail.data, evt: e }, true, true, true);
    if (sts) me.close();
  }

  #onEscape(e) {
    const me = this;
    if (!me.cancelable) return;
    if (e.key === 'Escape') me.close();
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
      if (els.length > 0) GSEvent.send(me, 'error', { type: 'modal', data: els }, true, true, true);
      return;
    }

    let sts = true;
    try {
      sts = GSEvent.send(me, 'action', { type: 'modal', ok: isOk, evt: e }, true, true, true);
    } finally {
      if (sts) me.close(null, isOk);
    }
  }

  #submitForm(form) {
    try {
      GSEvent.send(form, 'action', { action: 'submit' });
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
    const isOk = GSModal.#actions.includes(action);
    if (isOk) GSEvent.prevent(e);
    return isOk ? action : null;
  }

  get #size() {
    switch (this.size) {
      case 'extra' : return 'modal-xl';
      case 'large' : return 'modal-lg';
    }
    return '';
  }

  #setSize(size = '') {
    const me = this;
    const dlg = me.query('.modal-dialog');
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
    GSEvent.prevent(e);
    const me = this;
    const sts = GSEvent.send(me, 'open', { type: 'modal' }, true, true, true);
    if (sts) me.visible = true;
  }

  /**
   * Hide modal panel
   */
  close(e, ok = false) {
    GSEvent.prevent(e);
    const me = this;
    const sts = GSEvent.send(me, 'close', { type: 'modal', isOk: ok }, true, true, true);
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
    return this.query('.modal-ok');
  }

  get #buttonCancelEl() {
    return this.query('.modal-cancel');
  }

  #showEL(name) {
    const el = this.query(name);
    if (!el) return;
    el.classList.remove('d-none');
    el.classList.add('show', 'd-block');
  }

  #hideEL(name) {
    const el = this.query(name);
    if (!el) return;
    el.classList.add('d-none');
    el.classList.remove('show', 'd-block');
  }

  #update() {
    const me = this;
    GSDOM.toggle(me.#buttonOkEl, me.closable);
    GSDOM.toggle(me.#buttonCancelEl, me.cancelable);
    const css = `justify-content-${me.align}`;
    const footer = me.query('.modal-footer');
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


  get size() {
    return GSAttr.get(this, 'size', '');
  }

  set size(val = '') {
    GSAttr.set(this, 'size', val);
  }

  get title() {
    //return this.#findSlotOrEl('title', '.modal-title');
    return this.query('.modal-title');
  }

  set title(val = '') {
    GSDOM.setHTML(this.title, val);
  }

  get body() {
    // return this.#findSlotOrEl('body', '.modal-body');
    return this.query('.modal-body');
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

  get cssModal() {
    return GSAttr.get(this, "css-modal", "");
  }

  get cssContent() {
    return GSAttr.get(this, "css-content", "");
  }

  get cssHeader() {
    return GSAttr.get(this, "css-header", "");
  }

  get cssTitle() {
    return GSAttr.get(this, "css-title", "");
  }

  get cssBody() {
    return GSAttr.get(this, "css-body", "");
  }

  get cssFooter() {
    return GSAttr.get(this, "css-footer", "");
  }

  set cssModal(val = '') {
    return GSAttr.set(this, "css-modal", val);
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

  // css-modal, css-content css-header css-title css-body css-footer
  async getTemplate(val = '') {
    if (val) return super.getTemplate(val);
    const me = this;
    return `
         <div class="modal d-none fade ${me.cssModal}">
         <div class="modal-dialog modal-dialog-centered ${me.#size}">
           <div class="modal-content ${me.cssContent}">
             <div class="modal-header border-0 user-select-none ${me.cssHeader}">
               <div class="modal-title ${me.cssTitle}">
                 <slot name="title"></slot>
               </div>
             </div>
             <div class="modal-body ${me.cssBody}">
               <slot name="body"></slot>
             </div>
             <div class="modal-footer border-0 user-select-none justify-content-${me.align} ${me.cssFooter}">
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
