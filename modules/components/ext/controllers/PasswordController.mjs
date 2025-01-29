/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * Handle for input tpye password to support keyboard shortcut for password reveal.
 */
export class PasswordController {

  #host;

  #revealing = false;

  #keyUpCallback;
  #keyDownCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#keyUpCallback = me.#onKeyUp.bind(me);
    me.#keyDownCallback = me.#onKeyDown.bind(me);
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.#host.on('keyup', me.#keyUpCallback);
    me.#host.on('keydown', me.#keyDownCallback);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host.off('keyup', me.#keyUpCallback);
    me.#host.off('keydown', me.#keyDownCallback);
  }

  get reveal() {
    return this.#host.hasAttribute('reveal');
  }

  get type() {
    return this.#host?.type;
  }

  set type(val) {
    if (this.#host) this.#host.type = val;
  }

  #isReveal(e) {
    return this.reveal && e.key === 'Shift' && e.altKey && e.shiftKey && this.type === 'password';
  }

  #onKeyUp(e) {
    const me = this;
    if (e.key === 'Shift' && me.#revealing) {
      me.type = 'password';
    }
  }

  #onKeyDown(e) {
    const me = this;
    if (me.#isReveal(e)) {
      me.#revealing = true;
      me.type = 'text';
    }
  }
}  