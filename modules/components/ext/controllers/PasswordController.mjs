/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * Handle for input tpye password to support keyboard shortcut for password reveal.
 */
export class PasswordController {

  #host;

  #revealing = false;

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
  }

  hostConnected() {
    const me = this;
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
  }

  get reveal() {
    return this.#host.reveal;
  }

  get type() {
    return this.#host?.type;
  }

  set type(val) {
    if (this.#host) this.#host.type = val;
  }

  #isReveal(e) {
    return this.reveal && e.key === 'Shift' && e.altKey && e.ctrlKey && e.shiftKey && this.type === 'password';
  }

  onKeyUp(e) {
    const me = this;
    if (e.key === 'Shift' && me.#revealing) {
      me.type = 'password';
    }
  }

  onKeyDown(e) {
    const me = this;
    if (me.#isReveal(e)) {
      me.#revealing = true;
      me.type = 'text';
    }
  }
}  