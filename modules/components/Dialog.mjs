/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, css, html, ifDefined, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSID } from '../base/GSID.mjs';
import { size, SizeTypes } from '../properties/size.mjs';

export class GSDialogElement extends GSElement {

  static CSS = 'rounded shadow-sm';
  static HEADER_CSS = 'p-3';
  static TITLE_CSS = 'fs-5 fw-bold text-muted';
  static ALIGN = 'end';
  static CANCEL = 'Cancel';
  static CONFIRM = 'Ok';

  static #STACK = [];

  static styles = css`dialog {
      --bs-modal-width: 500px;
      width:var(--bs-modal-width);
      outline:none;
    }
    dialog::backdrop {
      backdrop-filter: blur(4px);
      backdrop-filter: blur(var(--gs-backdrop-blur));      
      background-color: var(--gs-backdrop-color);
      display: var(--gs-backdrop-display);
    }`;

  static properties = {

    standard: { reflect: true, type: Boolean },
    opened: { reflect: true, type: Boolean },
    cancelable: { reflect: true, type: Boolean },
    closable: { reflect: true, type: Boolean },
    escapable: { reflect: true, type: Boolean },
    disabled: { reflect: true, type: Boolean },

    size: size,

    title: { reflect: true },
    message: { reflect: true },
    cancelText: { reflect: true, attribute: 'text-cancel' },
    confirmText: { reflect: true, attribute: 'text-confirm' },

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

  #pass = false;
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

  firstUpdated() {
    super.firstUpdated();
    this.#pass = true;
  }

  _shouldUpdate(changed) {
    const me = this;
    return me.opened === true || me.#pass;
  }

  shouldUpdate(changed) {
    const me = this;
    const allowed = me.opened === true || me.#pass;
    // initially hidden dialogs rendering are posponed
    if (!allowed) {
      GSUtil.timeout(1000).then(() => {
        queueMicrotask(() => { 
          const allowed = me.opened === true || me.#pass;
          if (!allowed) {
            me.#pass = true;
            if (me.isConnected) me.requestUpdate();
          }
        });          
      });
    }
    return allowed;
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('opened')) {
      this.#onOpenChanged();
    }
  }

  #onOpenChanged() {
    const me = this;
    let state = null;
    if (me.opened) {
      GSDialogElement.#STACK.push(me);
      state = 'opening';
      if (me.standard) {
        me.#dialog?.open();
      } else {
        me.#dialog?.showModal();
      }
      me.#focusable()?.focus();
    } else {
      state = 'closing';
      if (me.isHashed) location.hash = '';
      GSDialogElement.#STACK.pop();
      me.#dialog?.close();
    }
    const sts = me.opened ? me.afterOpen?.() : me.afterClose?.();
    if (sts !== false) me.notify(true, false, state);
  }

  #renderConfirm() {
    const me = this;
    if (!me.closable) return '';
    return html`<gs-button  ${ref(me.#btnConfirmRef)} 
      @click="${me.#onConfirm.bind(me)}" 
      icon="${ifDefined(me.iconConfirm)}"
      language="${ifDefined(me.language)}"
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
      language="${ifDefined(me.language)}"
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
       <slot name="actions"></slot>
      ${me.#renderCancel()} &nbsp;${me.#renderConfirm()}
      </div>`;
  }

  #renderContent() {
    const me = this;
    const css = {
      card : true,
      [`p-${me.padding}`]: me.padding >= 0,
      [`m-${me.margin}`]: me.margin >= 0      
    }
    me.cssContent?.match(/[^ ]+/g).forEach(v => css[v]=true);
    return css;
  }

  renderClass() {
    const me = this;
    const size = SizeTypes[me.size];
    //...super.renderClass(),
    const css = {
      'dialog': true,
      'p-0': true,
      'border': me.bordered,
      'border-0': !me.bordered,
      'shadow-sm': me.shadow,
      'rounded': me.rounded,      
      [me.#styleID]: true,
      [`modal-${size}`]: size ? true : false
    }
    return css;
  }

  renderUI() {
    const me = this;
    const styles = {
      'min-width': me.minWidth > 0 ? `${me.minWidth}px` : undefined
    };
    me.dynamicStyle(me.#styleID, styles);
    return html`
        <dialog tabindex="-1" ${ref(me.#dialogRef)} 
            dir="${ifDefined(me.direction)}"
            @close="${me.#onCancel.bind(me)}"
            @cancel="${me.#onCancel.bind(me)}"
            @keydown="${me.#onKeyDown.bind(me)}"
            @form="${me.#onForm.bind(me)}"
            @validation="${me.#onFormValidation.bind(me)}"
            @confirm="${me.#onConfirm.bind(me)}"
            @submit="${me.#onSubmit.bind(me)}"
            class="${classMap(me.renderClass())}">
            <div class="${classMap(me.#renderContent())}">
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
                  </dialog>
                  `;
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
    me.message = message;
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
    //me.forms?.forEach?.(f => { f.reset(); f.data = data; });
    me.forms?.forEach?.(f => { f.data = data; });
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

  /**
   * Retrun true if dialog is opened by hashbang.
   * Used to clear the hashbang on close
   */
  get isHashed() {
    return GSUtil.asBool(this.dataset.gsHashed);
  }

  get form() {
    return this.query('gs-form', true, true);
  }

  get forms() {
    return this.queryAll('gs-form', true, true);
  }

  get tab() {
    return this.query('gs-tab', true, true);
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

  async #onConfirm(e) {
    const me = this;
    if (me.disabled) return;
    const ret = await Promise.all(me.forms?.map?.(form => form.submit()));
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

  #onFormValidation(e) {
    const me = this;
    me.#btnConfirm.disabled = e.detail.valid === false;
  }

  /**
   * Handle injected form events
   * @param {*} e 
   */
  #onForm(e) {
    let sts = true;
    const me = this;
    const data = e.detail;
    switch (data.type) {
      case 'submit':
        sts = me.emit('data', data.data, false, false, true);
        if (!sts) GSEvents.prevent(e);
        //me.opened = false;
        break;
      case 'valid':
        me.disabled = data.data === false;
        break;
    }
    return sts;
  }

  #onSubmit(e) {
    debugger;
  }

  static #updateStack() {
    GSDialogElement.#STACK = GSDialogElement.#STACK.filter(v => v.isConnected);
  }

  /**
   * Return number of dialogs in a stack
   */
  static get size() {
    return GSDialogElement.#STACK.length;
  }

  static get top() {
    GSDialogElement.#updateStack();
    const size = GSDialogElement.size;
    return size === 0 ? null : GSDialogElement.#STACK[size - 1];
  }

  static get opened() {
    GSDialogElement.#updateStack();
    return Array.from(GSDialogElement.#STACK);
  }

  static {
    this.define('gs-dialog');
  }

}