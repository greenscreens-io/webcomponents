/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { HANDLER } from "../../../base/GSConst.mjs";

export class FormController {

  #host = undefined;

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
  }

  hostConnected() {

  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host = undefined;
  }

  // trigger only first time
  hostUpdated() {

  }

  /**
   * Form reset event
   * @param {Event} e 
   */
  onReset(e) {
    this.#fieldsReset();
    this.#preValidate(e);
  }

  /**
   * Form submit event
   * @param {Event} e 
   */
  onSubmit(e) {
    const me = this;

  }

  /**
   * Event triggered on new FormData(form)
   * @param {Event} e 
   */
  onFormData(e) {
    const me = this;

  }

  /**
   * Event triggered after form validation.
   * Triggers after burst of field events like 'change', 'blur', 'invalid'.
   * @param {Event} e 
   */
  onValidation(e) {
    // console.debug('Form validation result: ', e.detail, e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onInvalid(e) {
    this.#preValidate(e);
  }

  onInput(e) {
    this.#doValidate(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onChange(e) {    
    this.#preValidate(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onBlur(e) {
    this.#preValidate(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */  
  onFocus(e) {
    this.#preValidate(e, true);
  }

  validate() {
    this.#postValidate(this, true, true, true);
  }

  get form() {
    return this.#host;
  }

  get inputs() {
    return this.form?.inputs;
  }

  #fieldsReset() {
    this.form.fields
      .map(f => f[HANDLER])
      .forEach(c => c?.onReset?.());
  }

  #toField(e) {
    return e?.detail?.target || e?.target;
  }

  #preValidate(e, focus = false) {
    const me = this;
    if (!focus) me.#doValidate(e, false);
    const field = me.#toField(e);
    if (field?.validity) field.validity.last = undefined;
    if (focus) me.#doValidate(e);
  }

  #doValidate(e, input = true) {
    const me = this;
    const field = me.#toField(e);
    if (field?.validity?.last === field?.validity?.valid) return;
    field.validity.last = field.validity.valid;
    
    const validity = field.validity.last;
    const valid = input ? input : me.form.checkValidity();
    me.#postValidate(me, validity, valid, false);

  }
  
  #postValidate(me, validity, valid, scheduled) {
    try {
          if(scheduled) valid = me.form.checkValidity();
          me.form.onvalidation?.(valid);
          const fields = me.form.fields.filter(f => !f.validity.valid);
          const obj = { valid: validity && valid && fields.length === 0, fields: fields };
          me.form.emit('validation', obj);
        } catch (error) {
          console.error('Error during form validation scheduling:', error);
        } 
  }
}