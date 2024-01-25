/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, createRef, css, html, ifDefined, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

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

    standard: { refelct: true, type: Boolean },
    opened: { refelct: true, type: Boolean },
    cancelable: { refelct: true, type: Boolean },
    closable: { refelct: true, type: Boolean },
    escapable: { refelct: true, type: Boolean },
    disabled: { refelct: true, type: Boolean },

    title: { refelct: true },
    message: { refelct: true },
    cancelText: { refelct: true, },
    confirmText: { refelct: true, },

    buttonAlign: { refelct: true, attribute: 'button-align' },

    iconCancel: { refelct: true, attribute: 'icon-cancel' },
    iconConfirm: { refelct: true, attribute: 'icon-confirm' },

    cssCancel: { attribute: 'css-cancel' },
    cssConfirm: { attribute: 'css-confirm' },

    cssTitle: { attribute: 'css-title' },
    cssHeader: { attribute: 'css-header' },
    cssFooter: { attribute: 'css-footer' },
    cssBody: { attribute: 'css-body' },
    cssContent: { attribute: 'css-content' },

  }

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

    me.css = clazz.CSS;
    me.cssTitle = clazz.TITLE_CSS;
    me.cssHeader = clazz.HEADER_CSS;
    me.buttonAlign = clazz.ALIGN;
    me.cancelText = clazz.CANCEL;
    me.confirmText = clazz.CONFIRM;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    GSDialogElement.#updateStack();
  }

  updated() {
    super.updated();
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
      css="${me.cssConfirm}" 
      color="primary" 
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
      css="${me.cssCancel}" 
      color="primary" 
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
    return html`
        <dialog tabindex="-1" ${ref(me.#dialogRef)} 
            dir="${ifDefined(me.direction)}"
            @close="${me.#onCancel.bind(me)}"
            @cancel="${me.#onCancel.bind(me)}"
            @keydown="${me.#onKeyDown.bind(me)}"
            class="dialog p-0 border-0 ${classMap(me.renderClass())}">
            <div class="card ${me.cssContent}">
                <div class="card-header user-select-none ${me.cssHeader}">
                  <div class="card-title ${me.cssTitle}">
                    <slot name="title">${me.translate(me.title)}</slot>
                  </div>
                </div>
                <div class="card-body ${me.cssBody}">
                  <slot name="body">${me.translate(me.message)}</slot>
                </div>
                ${me.#renderFooter()}
            </div>
            <slot name="extra"></slot>
            <div class="toast-container position-fixed"></slot></div>
        </dialog>`
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
    me.forms.forEach(f => {f.reset(); f.values = data;});
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
    return this.query('form', true);
  }

  get forms() {
    return this.queryAll('form', true);
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
    this.close();
    this.emit('click-action');
  }

  #onCancel(e) {
    this.close();
    this.emit('click-action');
  }

  #onKeyDown(e) {
    const me = this;
    if (e.key === 'Escape') {
      if (me.cancelable || me.escapable) {
        GSEvents.prevent(e);
        me.close();
      }
    }
  }

  static #updateStack() {
    const stack = GSDialogElement.#STACK;
    stack = stack.filter(v => v.isConnected);
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