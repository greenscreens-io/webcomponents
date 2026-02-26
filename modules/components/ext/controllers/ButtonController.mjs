/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSEvents } from "../../../base/GSEvents.mjs";
import { GSFunction } from "../../../base/GSFunction.mjs";

/**
 * Handle form button submit / reset 
 */
export class ButtonController {

  #host = undefined;
  #callback = undefined;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.form?.addController?.(me);
  }

  hostConnected() {
    const me = this;
    const btn = me.button;
    me.#callback = me.onClick.bind(me);
    me.#callback = btn.rateLimit > 0 ? GSFunction.debounce(me.#callback, btn.rateLimit, true) : me.#callback;
    btn.on('click', me.#callback);
  }

  hostDisconnected() {
    const me = this;
    const btn = me.button;
    btn?.off('click', me.#callback);
    btn?.removeController(me);
    me.#host = undefined;
    me.#callback = undefined;
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onInvalid(e) {
    this.updateState();
  }

  onValid(e) {
    this.updateState();
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onChange(e) {
    this.updateState();
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onBlur(e) {
    this.updateState();
  }

  onClick(e) {
    const btn = this.button;
    const form = this.form;
    if (form.disabled) {
      return GSEvents.prevent(e);
    }
    if (btn.isReset) {
      return form?.reset();
    }
    if (form && btn.isSubmit) {
      GSEvents.prevent(e);
      if (form.isValid) {
        form.requestSubmit();
      } else {
        btn.disabled = true;
      }
      return;
    }
    if (form && btn.isManaged) {
      if (!form.isValid) {
        btn.disabled = true;
        GSEvents.prevent(e);
      }
    }
  }

  updateState() {
    const btn = this.button;
    const form = this.form;
    if ((btn.isSubmit || btn.isManaged) && form?.disabled === false) btn.disabled = form.isValid === false;
  }

  get button() {
    return this.#host;
  }

  get form() {
    return this.#host?.form;
  }
}