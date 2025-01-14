/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { createRef, html, ifDefined, ref, repeat } from '../lib.mjs';
import { GSLog } from '../base/GSLog.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSFormGroupElement } from './FormGroup.mjs';

/**
 * Component is responsible for auto-building gs-form and gs-form-group elements
 * from either JSON data or GS-ITEM elements.
 */
export class GSFormPanelElement extends GSElement {

  static properties = {
    storage: {},
    formStorage: { attribute: 'form-storage' },
    disabled: { type: Boolean },
    data: { type: Array },
  }

  #formRef = createRef();

  constructor() {
    super();
    this.data = this.#proxify;
  }

  renderUI() {
    const me = this;
    return html`<gs-form ${ref(me.#formRef)}
      ?disabled=${me.disabled} 
      storage="${ifDefined(me.formStorage)}" 
      .locale="${me.locale}"
      .rtl="${me.rtl}"
      .css="${me.css}"
      .theme="${me.theme}"
      .margin="${me.margin}"
      .padding="${me.padding}"
      .border="${me.border}"
      .shadow="${me.shadow}"
      .os="${me.os}"
      .browser="${me.browser}"
      .environment="${me.environment}"
      .orientation="${me.orientation}"
      .protocol="${me.protocol}">
      <slot>
        ${repeat(me.data, (r) => html`<gs-form-group .data=${r} locale="${ifDefined(me.locale)}" ></gs-form-group>`)}
      </slot>
    </form>`;
  }

  get form() {
    return this.#formRef.value;
  }

  onDataRead(data) {
    this.data = data;
  }

  onDataError(e) {
    GSLog.error(this, e);
  }

  get #proxify() {
    return GSItem.collect(this).map(el => GSAttr.proxify(el, GSFormGroupElement.properties));
  }

  static {
    this.define('gs-form-panel');
  }

}