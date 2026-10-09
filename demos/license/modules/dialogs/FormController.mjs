/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSDOM } from '../../../../modules/base/GSDOM.mjs';

export class FormController  {

  
  #host = undefined;

  constructor(host) {
    host?.addController(this);
    this.#host = host;
  }

  hostDisconnected() {
    const me = this;
    me.#host?.removeController(me);
    me.#host = undefined;
  }

  hostConnected() {

  }

  // trigger only first time
  hostUpdated() {

  }

  formReset(e) {
    //this.#host.form?.reset();
  }

  get isForm() { return true;}

}