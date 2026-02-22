/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

export class ColorController {

  #host = undefined;

  constructor(host) {
    const me = this;
    me.#host = host.form.form;
    me.#host.addController(me);
  }

  hostConnected() {
    const me = this;
    
  }

  hostDisconnected() {
    const me = this;
    me.#host?.removeController(me);
    me.#host = undefined;
  }

  /**
   * Form reset event
   * @param {Event} e 
   */
  onReset(e) {
    const me = this;

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
   * Field event propagated to the form
   * @param {Event} e 
   */
  onChange(e) {

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