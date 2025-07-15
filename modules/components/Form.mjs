/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, html, ifDefined, ref, templateContent } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSLog } from '../base/GSLog.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { Utils } from '../../demos/webadmin/modules/utils/Utils.mjs';

export class GSFormElement extends GSElement {

  static properties = {
    storage: {},
    disabled: { type: Boolean },
    data: { type: Object },

    name: { reflect: true },
    rel: { reflect: true },
    acceptCharset: { reflect: true, attribute: 'accept-charset' },
    autocapitalize: { reflect: true },
    autocomplete: { reflect: true },

    action: { reflect: true },
    enctype: { reflect: true },
    method: { reflect: true },
    novalidate: { reflect: true, type: Boolean },
    target: { reflect: true },

    block: { type: Boolean },
    beep: { type: Boolean },
    timeout: { type: Number }
  }

  #formRef = createRef();
  #lastState = undefined;

  constructor() {
    super();
    this.data = {};
    this.disabled = false;
    this.method = "dialog";
  }

  renderUI() {
    const me = this;
    return html`<form ${ref(me.#formRef)}
      id="${ifDefined(me.name)}"
      name="${ifDefined(me.name)}"
      dir="${ifDefined(me.direction)}"
      class="${classMap(me.renderClass())}"
      @change="${me.#onChange}"
      @blur="${me.#onBlur}"
      @invalid="${me.#onInvalid}"
      @submit="${me.submit}"
      @reset="${me.reset}"
      method="${me.method}"
      
      rel="${ifDefined(me.rel)}"
      acceptCharset="${ifDefined(me.acceptCharset)}"
      autocapitalize="${ifDefined(me.autocapitalize)}"
      autocomplete="${ifDefined(me.autocomplete)}"
      action="${ifDefined(me.action)}"
      enctype="${ifDefined(me.enctype)}"
      target="${ifDefined(me.target)}"

      ?novalidate="${me.novalidate}">
      ${templateContent(me.#elementTemplate)}
      <slot>
      </slot>
    </form>`;
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    const me = this;
    me.dataController?.read();
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

  templateInjected() {
    const me = this;
    me.#doFilter(me.#filterField);
    me.invalid[0]?.focus();
  }

  async reset(e) {
    const me = this;
    const internal = e?.target === me.form;

    if (internal) {
      me.elements.forEach(el => GSDOM.reset(el));
      await me.dataController?.read(me.asJSON);
    } else {
      me.data = {};
      me.form.reset();
    }
  }

  async submit(e) {
    GSEvents.prevent(e);
    const me = this;
    if (me.disabled) return;
    if (!me.validate()) return;
    const json = me.asJSON;
    await me.dataController?.write(json);
    const data = { type: 'submit', data: json, source: e, owner: me };
    return me.emit('form', data, true, true, true);
  }

  #button(type) {
    return this.query(`button[type="${type}"]`, true);
  }

  get submitButton() {
    return this.#button('submit');
  }

  get resetButton() {
    return this.#button('reset');
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

  get invalid() {
    return this.inputs.filter(el => !el.validity.valid);
  }

  get asJSON() {
    const data = {};
    this.elements.forEach(field => GSDOM.fromElement2Object(field, data));
    return data;
  }

  set asJSON(data) {
    const me = this;
    //me.form.reset(); do not use, create a circular calls
    me.elements.forEach(field => GSDOM.fromObject2Element(field, data));
    me.#doFilter(me.#filterField);
    me.validate();
  }

  get isValid() {
    return this.elements
      .filter(el => !el.disabled)
      .filter(el => !el.validity.valid).length === 0;
  }

  /**
   * Find field by name
   * @param {*} name 
   * @returns 
   */
  field(name) {
    return name && this.fields.filter(f => f.name === name).pop();
  }

  checkValidity() {
    return this.form.checkValidity() &&
      this.elements
        .filter(el => !el.disabled)
        .filter(el => !el.checkValidity()).length === 0;;
  }

  reportValidity() {
    this.elements
      .filter(el => !el.disabled)
      .filter(el => !el.validity?.valid)
      .forEach(el => el.reportValidity());
    return this.form.reportValidity();
  }

  validate() {
    const me = this;
    let isValid = me.checkValidity();
    if (!isValid) me.reportValidity();
    isValid = me.onValidate(isValid);
    me.#toggle(isValid);
    me.#notify(isValid);
    me.invalid[0]?.focus();
    return isValid;
  }

  disable(all = false) {
    GSDOM.disableInput(this, 'gs-form-group, input, textarea, select, .btn', all, 'gsForm');
  }

  enable(all = false) {
    GSDOM.enableInput(this, 'gs-form-group, input, textarea, select, .btn', all, 'gsForm');
  }

  onDataRead(data) {
    this.data = data;
  }

  onDataWrite(data) {

  }

  onDataError(e) {
    GSLog.error(this, e);
  }

  /**
   * Called only if field is valid and changed
   * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} el 
   */
  onFieldChange(el) {

  }

  /**
   * Called only if field is invalid
   * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} el 
   */
  onFieldInvalid(el) {

  }

  onValidate(sts) {

    return sts;
  }

  #onInvalid(e) {
    const me = this;
    me.prevent(e);
    const field = me.#findField(e);
    if (field) me.onFieldInvalid(field);
    me.#toggle(false);
    me.#notify(false);
  }

  #onBlur(e) {
    const me = this;
    me.prevent(e);
    me.#toggle(me.isValid);
    me.#notify(me.isValid);
  }

  #onChange(e) {
    const me = this;
    me.prevent(e);
    const field = me.#findField(e);
    if (field) {
      me.#doFilter(field);
      me.handle(e);
      if (field.validity.valid) me.onFieldChange(field);
    }
    me.#toggle(me.isValid);
    me.#notify(me.isValid);
  }

  #notify(isValid = false) {
    const me = this;
    if (me.#lastState === isValid) return;
    me.#lastState = isValid;
    const data = { type: 'valid', data: isValid, owner: me };
    me.emit('form', data, true, true);
  }

  #toggle(isValid = false) {
    const me = this;
    const btn = me.submitButton;
    if (btn) btn.disabled = !isValid;
  }

  #findField(e) {
    if (!(e instanceof Event)) return;
    const me = this;
    let field = e.target;
    if (e.composed) {
      field = e.composedPath()
        .filter(el => me.#isField(el))
        .pop();
    }
    if (!me.#isField(field)) field = me.#findField(e.detail);
    return me.#isField(field) ? field : null;
  }

  #isField(el) {
    return el?.matches?.('input,select,textarea');
  }

  /**
   * Filter field disabled status
   * @param {HTMLInputElement} field 
   */
  #doFilter(field) {

    if (!field) return;

    const me = this;

    const value = me.#fieldValue(field);
    const fldName = me.dataset.gsfDisable;
    const fldVal = me.dataset.gsfValue;
    const matched = fldName && field.name === fldName;
    const flag = matched && value === fldVal;
    if (matched) {
      me.elements      
        .filter(el => el.name != fldName)        
        .forEach(el => el.disabled = flag);
    }

  }

  /**
   * Initialy, field might not be set just yet (if it is selectable),
   * so we need to take valeu fro mgs-item definition
   * @param {*} field 
   * @returns 
   */
  #fieldValue(field) {
    let value = field.tagName === 'GS-FORM-GROUP' ? field.field?.value : field.value;
    if (field.selectable && GSUtil.isNull(value)) {
      value = GSAttr.get(this.query('gs-item[selected]'), 'value');
    }
    return value;
  }

  #childrens(shadow = false) {
    return this.queryAll('input,select,output,textarea', shadow);
  }

  get #filterField() {
    const me = this;
    return me.elements.filter(el => el.name === me.dataset.gsfDisable).pop();
  }

  get #elementTemplate() {
    const tplEl = this.firstElementChild;
    return GSDOM.isTemplateElement(tplEl) ? tplEl : undefined;
  }

  static {
    this.define('gs-form');
  }

}