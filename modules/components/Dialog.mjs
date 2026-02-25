/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, css, html, ifDefined, ref } from '../lib.mjs';
import { GSElement, HANDLER_KEY } from '../GSElement.mjs';
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

  shouldUpdate(changed) {
    const me = this;
    const allowed = me.opened === true || me.#pass;
    // initially hidden dialogs rendering are postponed
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
    const sts = me.opened ? me.afterOpen() : me.afterClose();
    if (sts !== false) me.notify(true, false, state);
  }

  addController(controller) {
    if (controller.isDialog) {
      this[HANDLER_KEY]?.add(controller);
    }
    super.addController?.(controller);
  }

  afterOpen() {
    const me = this;
    me[HANDLER_KEY]?.forEach((c) => c.afterOpen?.(me));
    return me.emit('open', null, false, false, true);
  }

  afterClose() {
    const me = this;
    me[HANDLER_KEY]?.forEach((c) => c.afterClose?.(me));
    return me.emit('close', null, false, false, true);
  }

  #renderConfirm() {
    const me = this;
    if (!me.closable) return '';
    return html`<gs-button type="button"
      ${ref(me.#btnConfirmRef)} 
      @click="${me.#onBtnConfirm.bind(me)}" 
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
    return html`<gs-button type="button"
      ${ref(me.#btnCancelRef)}      
      @click="${me.#onBtnCancel.bind(me)}" 
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
        <dialog closedby="none" tabindex="-1" ${ref(me.#dialogRef)} 
            dir="${ifDefined(me.direction)}"
            @close="${me.#onDlgClose.bind(me)}"
            @cancel="${me.#onDlgCancel.bind(me)}"
            @keydown="${me.#onKeyDown.bind(me)}"
            @formsubmit="${me.#onBtnConfirm.bind(me)}"
            @submit="${me.#onBtnConfirm.bind(me)}"
            @validation="${me.#onFormValidation.bind(me)}"
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
    if (closable || cancelable) return me.waitEvent('close');
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

  async waitClose() {
    return this.waitEvent('close');
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

  #onDlgClose(e) {
    this.close();
  }

  #onDlgCancel(e) {
    const me = this;
    const forms = me.forms;
    if (forms) {
      const isInvalid = forms.map(form => form.isValid).filter(v => v === false).length > 0;
      if (isInvalid) return GSEvents.prevent(e);
    }
    me.close();
  }

  #onBtnConfirm(e) {
    const me = this;
    if (me.disabled) return;
    me.#dialog?.requestClose();
  }

  #onBtnCancel(e) {
    this.close();
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