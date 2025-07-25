/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

export class FormController {

  #host = undefined;
  #processing = false;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#processing = false;
    host.addController(me);
  }

  hostConnected() {

  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host = undefined;
    me.#processing = false;
  }

  hostUpdated() {
    // trigger only first time
    if (!this.#host.hasUpdated) {

    }
  }

  /**
   * Form reset event
   * @param {*} e 
   */
  onReset(Event) {
    const me = this;

  }

  /**
   * Form submit event
   * @param {*} e 
   */
  onSubmit(Event) {
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
   * Field event propagated to the form
   * @param {Event} e 
   */
  onInvalid(e) {
    const me = this;

  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */  
  onChange(e) {
    const me = this;

  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */  
  onBlur(e) {

  }  

  get form() {
    return this.#host.form;
  }

  get inputs() {
    return this.form?.inputs;
  }

}