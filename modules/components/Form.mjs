/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { createRef, html, ifDefined, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSLog } from '../base/GSLog.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

export class GSFormElement extends GSElement {

  static properties = {
    storage: {},
    disabled: { type: Boolean },
    data: { type: Object },
  }

  #formRef = createRef();

  constructor() {
    super();
    this.data = {};
  }

  renderUI() {
    const me = this;
    return html`<form ${ref(me.#formRef)}
      dir="${ifDefined(me.direction)}"
      @change="${me.#onChange}"
      @submit="${me.submit}"
      @reset="${me.reset}"
      method="dialog">
      <slot></slot>
    </form>`;
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    this.dataController?.read();
  }

  updated(changed) {
    const me = this;
    if (changed.has('disabled')) {
      if (me.disabled) {
        me.disable();
      } else {
        me.enable();
      }
    }
    if (changed.has('data')) {
      if (GSUtil.isNull(me.data)) {
        me.reset();
      } else {
        me.asJSON = Object.assign(me.asJSON, me.data);
      }
    }
  }

  async reset(e) {
    const me = this;
    const internal = e?.target === me.form;

    if (internal) {
      // not required, form will reset on it's own
      //me.elements.forEach(el => el.value = el.defaultValue);
      await me.dataController?.read(me.asJSON);
    } else {
      me.data = {};
      me.form.reset();
    }
  }

  async submit(e) {
    GSEvents.prevent(e);
    const me = this;
    if (!me.validate()) return;
    const json = me.asJSON;
    await me.dataController?.write(json);
    const data = { type: 'submit', data: json, source: e, owner : me};
    return me.emit('form', data, true, true, true);
  }

  #childrens(shadow = false) {
    return this.queryAll('input,select,output,textarea,gs-form-group', shadow);
  }

  get form() {
    return this.#formRef.value;
  }

  /**
  * Overide native to pickup all form elements, including ones in shadow dom
  */
  get elements() {
    return this.#childrens(true);
  }

  get fields() {
    return this.elements;
  }

  get inputs() {
    return this.elements;
  }

  get asJSON() {
    return GSDOM.toObject(this);
  }

  set asJSON(data) {
    const me = this;
    GSDOM.fromObject(me, data);
    return me.validate();
  }

  get isValid() {
    return this.#childrens(false)
      .filter(el => GSDOM.isVisible(el))
      .map(el => el.checkValidity())
      .filter(v => v === false).length === 0;
  }

  checkValidity() {
    return this.isValid && this.form.checkValidity();
  }

  reportValidity() {
    this.#childrens(false)
      .filter(el => GSDOM.isVisible(el))
      .filter(el => !el.checkValidity())
      .forEach(el => el.reportValidity() );
    return this.form.reportValidity();
  }

  validate() {
    const me = this;
    let isValid = me.checkValidity();
    if (!isValid) me.reportValidity();
    const data = { type: 'valid', data: isValid, owner : me};
    isValid = me.onValidate(isValid);
    if (isValid) me.emit('form', data, true, true);
    return isValid;
  }

  disable() {
    GSDOM.disableInput(this, 'gs-form-group, input, textarea, select, .btn', false, 'gsForm');
  }

  enable() {
    GSDOM.enableInput(this, 'gs-form-group, input, textarea, select, .btn', false, 'gsForm');
  }

  onDataRead(data) {
    this.data = data;
  }

  onDataWrite(data) {

  }

  onDataError(e) {
    GSLog.error(this, e);
  }

  onFieldChange(el) {

  }

  onValidate(sts) {

    return sts;
  }

  #onChange(e) {
    const me = this;
    let field = e.target;
    if (e.composed) {
      field = e.composedPath()
        .filter(el => el.matches?.('input,select,textarea,gs-form-group'))
        .pop();
    }
    me.#doFilter(field);
    me.handle(e);
    if (me.validate()) me.onFieldChange(e.detail);
  }

  /**
   * Filter field disabled status
   * @param {HTMLInputElement} field 
   */
  #doFilter(field) {
    if(!field) return;
    const me = this;
    const fldName = me.dataset.gsfDisable;
    const fldVal = me.dataset.gsfValue;
    const matched = fldName && field.name === fldName;
    const flag = matched && field.value === fldVal;
    if (matched) {
      me.elements
        .filter(el => el.name != fldName)
        .forEach(el => el.disabled = flag);
    } 

  }

  static {
    this.define('gs-form');
  }

}