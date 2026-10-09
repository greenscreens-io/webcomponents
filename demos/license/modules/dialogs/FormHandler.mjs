/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSDOM } from '../../../../modules/base/GSDOM.mjs';
import { FormController } from './FormController.mjs';

// simple form UI controller 
export class FormHandler extends HTMLElement {

  static {
    GSDOM.define('gs-formui-handler', FormHandler);
  }
 
  #host;
  #controller;

  connectedCallback() {
    const me = this;
    me.#controller = new FormController(me.host);
  }

  disconnectedCallback() {
    const me = this;
    me.#host = undefined;
    me.#controller = undefined;
  }


  get host() {
    const me = this
    me.#host ??= GSDOM.closest(me, 'gs-form');
    return me.#host;
  }

}