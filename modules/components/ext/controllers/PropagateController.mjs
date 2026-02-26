/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { HANDLER } from "../../../base/GSConst.mjs";

/**
 * Propagate event to a parent form controller
 */
export class PropagateController {

  #host = undefined;
  #handler = undefined;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.#handler = me.#host.closest('form')?.handler;
  }

  hostDisconnected() {
    const me = this;
    me.#host?.removeController(me);
    me.#host = undefined;
    me.#handler = undefined;
  }

  // trigger only first time
  hostUpdated() {

  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onInvalid(e) {
    this.handler.onInvalid?.(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onChange(e) {
    this.handler.onChange?.(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onBlur(e) {
    this.handler.onBlur?.(e);
  }

  /**
   * Field event propagated to the form
   * @param {Event} e 
   */
  onFocus(e) {
    this.handler.onFocus?.(e);
  }

  get handler() {
    const me = this;
    me.#handler ??= me.#host?.closest('form')?.[HANDLER];
    return me.#handler;
  }
}