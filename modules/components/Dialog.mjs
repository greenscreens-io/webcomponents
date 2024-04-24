/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, createRef, css, html, ifDefined, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSID } from '../base/GSID.mjs';

export class GSDialogElement extends GSElement {

  static CSS = 'rounded shadow-sm';
  static HEADER_CSS = 'p-3';
  static TITLE_CSS = 'fs-5 fw-bold text-muted';
  static ALIGN = 'end';
  static CANCEL = 'Cancel';
  static CONFIRM = 'Ok';

  static #STACK = [];

  static styles = css`dialog{outline:none;}dialog::backdrop{backdrop-filter: blur(4px);}`;

  static properties = {

    standard: { reflect: true, type: Boolean },
    opened: { reflect: true, type: Boolean },
    cancelable: { reflect: true, type: Boolean },
    closable: { reflect: true, type: Boolean },
    escapable: { reflect: true, type: Boolean },
    disabled: { reflect: true, type: Boolean },


    title: { reflect: true },
    message: { reflect: true },
    cancelText: { reflect: true, },
    confirmText: { reflect: true, },

    minWidth: { reflect: true, type: Number, attribute: 'min-width' },
    buttonAlign: { reflect: true, attribute: 'button-align' },

    iconCancel: { reflect: true, attribute: 'icon-cancel' },
    iconConfirm: { reflect: true, attribute: 'icon-confirm' },

    colorCancel: { attribute: 'color-cancel' },
    colorConfirm: { attribute: 'color-confirm' },

    cssCancel: { attribute: 'css-cancel' },
    cssConfirm: { attribute: 'css-confirm' },

    cssTitle: { attribute: 'css-title' },
    cssHeader: { attribute: 'css-header' },
    cssFooter: { attribute: 'css-footer' },
    cssBody: { attribute: 'css-body' },
    cssContent: { attribute: 'css-content' },

  }

  #styleID = GSID.id;
  #dialogRef = createRef();
  #btnConfirmRef = createRef();
  #btnCancelRef = createRef();

  constructor() {
    super();
    const me = this;
    const clazz = GSDialogElement;
    me.opened = false;
    me.standard = false;
    me.cancelable = false;
    me.closable = false;
    me.escapable = false;
    me.disabled = false;
    me.shadow = false;
    me.rounded = false;

    me.minWidth = 0;
    me.css = clazz.CSS;
    me.cssTitle = clazz.TITLE_CSS;
    me.cssHeader = clazz.HEADER_CSS;
    me.buttonAlign = clazz.ALIGN;
    me.cancelText = clazz.CANCEL;
    me.confirmText = clazz.CONFIRM;
    me.colorCancel = 'secondary';
    me.colorConfirm = 'primary';
    me.dynamicStyle(me.#styleID);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    GSDialogElement.#updateStack();
  }

  updated(changed) {
    super.updated(changed);
    const me = this;
    if (me.opened) {
      GSDialogElement.#STACK.push(me);
      if (me.standard) {
        me.#dialog?.open();
      } else {
        me.#dialog?.showModal();
      }
      me.#focusable()?.focus();
    } else {
      GSDialogElement.#STACK.pop();
      me.#dialog?.close();
    }
    me.notify();
  }

  #renderConfirm() {
    const me = this;
    if (!me.closable) return '';
    return html`<gs-button  ${ref(me.#btnConfirmRef)} 
      @click="${me.#onConfirm.bind(me)}" 
      icon="${ifDefined(me.iconConfirm)}"
      locale="${ifDefined(me.locale)}"
      .disabled="${me.disabled}"  
      css="${ifDefined(me.cssConfirm)}" 
      color="${ifDefined(me.colorConfirm)}" 
      title="${me.confirmText}">
      </gs-button>`;
  }

  #renderCancel() {
    const me = this;
    if (!me.cancelable) return '';
    return html`<gs-button ${ref(me.#btnCancelRef)}
      @click="${me.#onCancel.bind(me)}" 
      icon="${ifDefined(me.iconCancel)}"
      locale="${ifDefined(me.locale)}"
      css="${ifDefined(me.cssCancel)}" 
      color="${ifDefined(me.colorCancel)}" 
      title="${me.cancelText}">
      </gs-button>`;
  }

  #renderFooter() {
    const me = this;
    const isFooter = me.cancelable || me.closable;
    if (!isFooter) return '';
    return html`<div class="card-footer d-flex user-select-none justify-content-${me.buttonAlign} ${me.cssFooter}">
      ${me.#renderCancel()} &nbsp;${me.#renderConfirm()}
      </div>`;
  }

  renderUI() {
    const me = this;
    const styles = { 'min-width': me.minWidth > 0 ? `${me.minWidth}px` : undefined };
    me.dynamicStyle(me.#styleID, styles);
    return html`
        <dialog tabindex="-1" ${ref(me.#dialogRef)} 
            dir="${ifDefined(me.direction)}"
            @close="${me.#onCancel.bind(me)}"
            @cancel="${me.#onCancel.bind(me)}"
            @keydown="${me.#onKeyDown.bind(me)}"
            @form="${me.#onForm.bind(me)}"
            @submit="${me.#onSubmit.bind(me)}"
            class="${classMap(me.renderClass())}">
            <div class="card ${me.cssContent}">
                <div class="card-header user-select-none ${me.cssHeader}">
                  <div class="card-title ${me.cssTitle}">
                    <slot name="title">${me.translate(me.title)}</slot>
                  </div>
                </div>
                <div class="card-body ${me.cssBody}">
                  <slot name="body">
                  ${me.translate(me.message)}
                  ${me.renderTemplate()}
                  </slot>
                </div>
                ${me.#renderFooter()}
            </div>
            <slot name="extra"></slot>
            <div class="toast-container position-fixed"></slot></div>
        </dialog>`
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'dialog': true,
      'p-0': true,
      'border-0': true,
      [me.#styleID]: true
    }
    return css;
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
    me.closable = closable;
    me.cancelable = cancelable;
    me.escapable = cancelable;
    me.open();
    if (closable || cancelable) return me.waitEvent('click-action');
  }

  confirm(title = '', message = '') {
    return this.info(title, message, true, false);
  }

  prompt(title = '', message = '') {
    return this.info(title, message, true, true);
  }

  reset(data, index = 0) {
    index = GSUtil.asNum(index, 0);
    const me = this;
    me.forms.forEach(f => { f.reset(); f.values = data; });
    const tab = me.tab;
    if (tab && index > -1) tab.index = index;
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  toggle() {
    this.opened = !this.opened;
  }

  get form() {
    return this.query('gs-form', true);
  }

  get forms() {
    return this.queryAll('gs-form', true);
  }

  get tab() {
    return this.query('gs-tab', true);
  }

  get #dialog() {
    return this.#dialogRef.value;
  }

  get #btnConfirm() {
    return this.#btnConfirmRef.value;
  }

  get #btnCancel() {
    return this.#btnCancelRef.value;
  }

  /**
   * Return active button
   * @returns {HTMLButtonElement|GSButton}
   */
  #focusable() {
    const me = this;
    const form = me.queryAll(GSDOM.QUERY_INPUT, true).filter(el => GSDOM.isVisible(el)).shift();
    if (form) return form;
    if (me.cancelable) return me.#btnCancel;
    if (me.closable) return me.#btnConfirm;
    return me;
  }

  #onConfirm(e) {
    const me = this;
    if (me.disabled) return;
    //me.forms.forEach(form => form.submit());
    const ret = me.forms.map(form => form.submit());
    if (ret.indexOf(false) < 0) me.close();
  }

  #onCancel(e) {
    const me = this;
    me.close();
  }

  #onKeyDown(e) {
    const me = this;
    if (e.key === 'Escape') {
      GSEvents.prevent(e);
      if (me.cancelable || me.escapable) {
        me.close();
      }
    }
  }

  /**
   * Handle injected form events
   * @param {*} e 
   */
  #onForm(e) {
    const me = this;
    const data = e.detail;
    switch (data.type) {
      case 'submit':
        const sts = me.emit('data', data.data, false, false, true);
        if (!sts) GSEvents.prevent(e);
        //me.opened = false;
        break;
      case 'valid':
        me.disabled = data.data === false;
        break;
    }
  }

  #onSubmit(e) {
    debugger;
  }

  static #updateStack() {
    GSDialogElement.#STACK = GSDialogElement.#STACK.filter(v => v.isConnected);
  }

  static get top() {
    GSDialogElement.#updateStack();
    const stack = GSDialogElement.#STACK;
    if (stack.length === 0) return null;
    return stack[stack.length - 1];
  }

  static {
    this.define('gs-dialog');
  }

}