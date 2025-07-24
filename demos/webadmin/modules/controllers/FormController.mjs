/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSDOM } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

// simple form UI controller for two features
// 1. to disable all other fields when main field (selector) is disabled.
// 2. If there is a tab-panel within a form, mark tabs with invalid fields
export class FormController extends HTMLElement {

  static {
    GSDOM.define('gs-formui-handler', FormController);
  }

  #host = undefined;
  #tabGroupEl = undefined;
  #selectorEl = undefined;

  #formCallback = undefined;
  #blurCallback = undefined;
  #changeCallback = undefined;
  #invalidCallback = undefined;
  #first = true;

  connectedCallback() {
    const me = this;
    me.#host = GSDOM.closest(me, 'gs-form');
    if (me.#host) {
      me.#formCallback = me.onForm.bind(me);
      me.#blurCallback = me.onBlur.bind(me);
      me.#changeCallback = me.onChange.bind(me);
      me.#invalidCallback = me.onInvalid.bind(me);
      me.#host.on('form', me.#formCallback);
    }
  }

  disconnectedCallback() {
    const me = this;
    if (me.#host) {
      me.#host.off('form', me.#formCallback);
      me.form?.off('blur', me.#blurCallback);
      me.form?.off('change', me.#changeCallback);
      me.form?.off('invalid', me.#invalidCallback);
    }
    me.#formCallback = undefined;
    me.#blurCallback = undefined;
    me.#changeCallback = undefined;
    me.#invalidCallback = undefined;
    me.#host = undefined;
    me.#tabGroupEl = undefined;
    me.#selectorEl = undefined;
  }

  onInvalid(e) {
    const me = this;
    const tab = me.#findTab(e)?.tab;
    if (tab) tab.badge = true;
  }

  onBlur(e) {
    const me = this;
    me.#doTab(e);
  }

  onChange(e) {
    const me = this;
    const field = me.#findField(e);
    me.#doFilter(field);
    me.#doTab(e);
  }

  // activate listeners when form ready
  onForm(e) {
    const me = this;
    if (me.#first) {
      me.#first = false;
      me.form.on('blur', me.#blurCallback);
      me.form.on('change', me.#changeCallback);
      me.form.on('invalid', me.#invalidCallback);
      requestAnimationFrame(() => me.#doFilter(me.selector));
    }
    if (me.form.isValid) {
      me.tabs?.forEach(t => t.badge = false);
    }
    if (!me.#tabGroupEl) {
      me.#tabGroupEl?.on('group-selected', e => console.log("=>>>>", e));
    }
  }

  get form() {
    return this.#host?.form;
  }

  get inputs() {
    return this.#host?.inputs;
  }

  get selector() {
    const me = this;
    const name = me.dataset.disable;
    if (name) {
      me.#selectorEl ??= me.inputs?.filter(el => el.name === name).pop();
    }
    return me.#selectorEl;
  }

  get tabs() {
    return this.tabGroup?.tabs;
  }

  get tabGroup() {
    const me = this;
    me.#tabGroupEl ??= me.#host.query('gs-tab-group', true);
    return me.#tabGroupEl;
  }

  #doTab(e) {
    const me = this;
    const panel = me.#findTab(e);
    if (panel) {
      if (me.form.isValid) {
        panel.tabs.forEach(t => t.badge = false);
      } else {
        panel.tab.badge = me.#panelFields(panel).length > 0;
      }
    }

  }

  #panelFields(panel) {
    return GSDOM.formElements(panel).filter(el => !el.disabled && !el.validity.valid);
  }

  #findTab(e) {
    return e.composedPath().filter(el => el.tagName === 'GS-TAB-PANEL').pop();
  }

  #findField(e) {
    if (!(e instanceof Event)) return null;
    const me = this;
    const el = me.#findField(e.detail);
    return (el || e.target?.field || e.target || this.selector);
  }

  /**
   * Filter field disabled status
   * @param {HTMLInputElement} field 
   */
  #doFilter(field) {

    const me = this;
    const fldName = me.dataset.disable;
    const fldVal = me.dataset.value;

    const form = me.#host;
    const isSelector = fldName === field?.name;

    if (!(isSelector && form && field)) return;

    const matched = fldName && field.name === fldName;
    const flag = matched && field.value === fldVal;

    if (matched) {
      me.inputs?.filter(el => el.name != fldName)
        .forEach(el => el.disabled = flag);
    }

  }

}