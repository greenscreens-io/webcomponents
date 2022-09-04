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
    me.attachEvent(me, 'form', me.#onForm.bind(me));
    me.attachEvent(me, 'modal', me.#onModal.bind(me));
    me.attachEvent(document, 'keyup', me.#onEscape.bind(me));
    super.onReady();
    if (me.visible) me.open();
  }

  #onModal(e) {
    const me = this;
    const sts = me.#validateCaller(e, e.target, 'close', 'GS-MODAL');
    if (!sts) return;
    GSEvent.prevent(e);
    me.close();
  }

  #onForm(e) {
    const me = this;
    let sts = me.#validateCaller(e, e.target, 'submit', 'GS-MODAL');
    if (!sts) return;
    GSEvent.prevent(e);
    sts = GSEvent.send(me, 'data', { type: 'modal', data: e.detail.data, evt: e }, true, true, true);
    if (sts) me.close();
  }

  #validateCaller(e, own, type, comp) {
    if (e.detail.type !== type) return false;
    const parent = GSDOM.closest(own, comp);
    return parent == this;
  }

  #onEscape(e) {
    const me = this;
    if (!me.cancelable) return;
    if (e.key === 'Escape') me.close();
  }

  #onClick(e) {
    const me = this;
    let sts = true;
    try {
      const el = e.composedPath().shift();
      const action = el?.dataset.action;
      if (GSModal.#actions.indexOf(action) < 0) return sts = false;
      GSEvent.prevent(e);
      const isOk = action === 'ok';
      sts = GSEvent.send(me, 'action', { type: 'modal', ok: isOk, evt: e }, true, true, true);
    } finally {
      if (sts) me.close();
    }
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
  close(e) {
    GSEvent.prevent(e);
    const me = this;
    const sts = GSEvent.send(me, 'close', { type: 'modal' }, true, true, true);
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
    GSDOM.toggleClass(me.#buttonOkEl, !me.closable);
    GSDOM.toggleClass(me.#buttonCancelEl, !me.cancelable);
    const css = `justify-content-${me.align}`;
    const footer = me.query('.modal-footer');
    GSDOM.toggleClass(footer, true, css);
  }
  
	/**
	 * Search for named slot tag or css selector 
	 * @param {string} name Tagged slot  name
	 * @param {*} qry CSS selector
	 * @returns {HTMLElement|Array<HTMLElement>}
	 */
	#findSlotOrEl(name = '', qry = '') {
    const me = this;
		const el = name ? me.self.querySelector(`[slot="${name}"]`) : null;
		if (!el) el = me.self.querySelector(qry);
    return el;
	}


  get title() {
    return this.#findSlotOrEl(this, 'title', '.modal-title');
  }

  set title(val = '') {
    this.title.innerHTML = val;
  }

  get body() {
    return this.#findSlotOrEl(this, 'body', '.modal-body');
  }

  set body(val = '') {
    this.body.innerHTML = val;
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
    return GSAttr.get(this, 'align', 'end');
  }

  set align(val = 'end') {
    GSAttr.set(this, 'align', val);
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

  // css-modal, css-content css-header css-title css-body css-footer
  async getTemplate(val = '') {
    if (val) return super.getTemplate(val);
    const me = this;
    return `
        <div class="modal d-none fade ${me.cssModal}">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content ${me.cssContent}">
            <div class="modal-header border-0 ${me.cssHeader}">
              <div class="modal-title ${me.cssTitle}">
                <slot name="title"></slot>
              </div>
            </div>
            <div class="modal-body ${me.cssBody}">
              <slot name="body"></slot>
            </div>
            <div class="modal-footer border-0 justify-content-${me.align} ${me.cssFooter}">
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


