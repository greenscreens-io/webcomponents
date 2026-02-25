/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSDOM } from "../../../base/GSDOM.mjs";

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
    const me = this;
    me.#scheduleValidate(e);
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
    this.#scheduleValidate(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onChange(e) {
    this.#scheduleValidate(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onBlur(e) {
    this.#scheduleValidate(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */  
  onFocus(e) {
  
  }

  validate() {
    this.#scheduleValidate();
  }

  get form() {
    return this.#host;
  }

  get inputs() {
    return this.form?.inputs;
  }

  #isScheduled = false;
  #fields = new Set();

  #scheduleValidate(e) {
    const me = this;

    const field = e?.detail?.target || e?.target;
    const isFormField = GSDOM.isFormElement(field);
    if (isFormField && !field.validity.valid) {
      me.#fields.add(field);
    }

    if (me.#isScheduled) {
      return;
    }
    me.#isScheduled = true;

    requestAnimationFrame(() => {
      if (!me.form) {
        me.#isScheduled = false;
        return;
      }
      try {
        // valid might be incorrect if 
        // - gs-form content is not wrapped in template
        // - fields are outside of gs-form / form, injected thrugh slots
        // thus we need to check individual fields too
        const valid = me.form.checkValidity();
        me.form.onvalidation?.(valid);
        const fields = Array.from(me.#fields).filter(f => !f.validity.valid);
        me.#fields.clear();
        const obj = { valid: valid && fields.length === 0, fields: fields };
        me.form.emit('validation', obj);
      } catch (error) {
        console.error('Error during form validation scheduling:', error);
      } finally {
        me.#isScheduled = false;
      }
    });
  }
}