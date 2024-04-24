/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { createRef, html, ifDefined, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSLog } from '../base/GSLog.mjs';
import { GSEvents } from '../base/GSEvents.mjs';

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
      me.asJSON = me.data;
    }
  }

  get form() {
    return this.#formRef.value;
  }

  get isValid() {
    return this.elements
      .filter(el => GSDOM.isVisible(el))
      .map(el => el.checkValidity())
      .filter(v => v === false).length === 0;
  }

  /**
  * Overide native to pickup all form elements, including ones in shadow dom
  */
  get elements() {
    return this.queryAll('input,select,output,textarea', true);
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

  disable() {
    GSDOM.disableInput(this, 'gs-form-group, input, textarea, select, .btn', false, 'gsForm');
  }

  enable() {
    GSDOM.enableInput(this, 'gs-form-group, input, textarea, select, .btn', false, 'gsForm');
  }

  checkValidity() {
    return this.form.checkValidity();
  }

  reportValidity() {
    this.elements
      .filter(el => GSDOM.isVisible(el))
      .filter(el => !el.checkValidity())
      .forEach(el => el.reportValidity() );
    return this.form.reportValidity();
  }

  reset(e) {
    const me = this;
    const internal = e?.target === me.form;

    if (internal) {
      me.elements.forEach(el => el.value = el.defaultValue);
      me.dataController?.read(me.asJSON);
    } else {
      me.data = {};
      me.form.reset();
    }
  }

  submit(e) {
    GSEvents.prevent(e);
    const me = this;
    if (!me.validate()) return;
    const json = me.asJSON;
    me.dataController?.write(json);
    const data = { type: 'submit', data: json, source: e, owner : me};
    return me.emit('form', data, true, true, true);
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

  validate() {
    const me = this;
    const isValid = me.checkValidity() && me.isValid;
    if (!isValid) me.reportValidity();
    const data = { type: 'valid', data: isValid, owner : me};
    me.emit('form', data, true, true);
    return isValid;
  }

  #onChange(e) {
    const me = this;
    if (me.isBindable) me.handle(e);
    if (me.validate()) me.onFieldChange(e.detail);
  }

  static {
    this.define('gs-form');
  }

}