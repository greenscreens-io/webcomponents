/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSDOM } from "../../../../modules/base/GSDOM.mjs";
import { GSUtil } from "../../../../modules/base/GSUtil.mjs";

// simple form UI controller for 
// 1. If there is a tab-panel within a form, mark tabs with invalid fields
export class FormController extends HTMLElement {

  static {
    GSDOM.define('gs-formui-handler', FormController);
  }

  #host = undefined;
  #tabGroupEl = undefined;

  #validationCallback = undefined;

  connectedCallback() {
    const me = this;
    if (me.host) {
      me.#validationCallback = me.onValidation.bind(me);
      me.host.on('validation', me.#validationCallback);
    }
  }

  disconnectedCallback() {
    const me = this;
    me.#host?.off('validation', me.#validationCallback);
    me.#validationCallback = undefined;
    me.#host = undefined;
    me.#tabGroupEl = undefined;
  }

  onValidation(e) {
    this.tabGroup?.clear();
    e.detail.fields?.map(el => el.closest('gs-tab-panel'))
      .filter(el => GSUtil.nonNull(el))
      .map(el => { el.clear(); return el;})
      .forEach(el => el.tab.badge = true);
  }

  get host() {
    const me = this
    me.#host ??= GSDOM.closest(me, 'gs-form');
    return me.#host;
  }

  get tabs() {
    return this.tabGroup?.tabs;
  }

  get tabGroup() {
    const me = this;
    me.#tabGroupEl ??= me.#host.query('gs-tab-group', true);
    return me.#tabGroupEl;
  }
}