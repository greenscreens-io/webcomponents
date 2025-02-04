/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSRouter } from '../base/GSRouter.mjs';
import { GSElement } from '../GSElement.mjs';

export class GSRouterElement extends GSElement {

  #router = null;

  static properties = {
    url: {},
    disabled: { type: Boolean },
    logging: { type: Boolean }
  };

  constructor() {
    super();
    this.logging = false;
    this.#router = new GSRouter();
    this.#router.log = false;
  }

  renderUI() {
    return '';
  }

  updated(changed) {
    this.#router.log = this.logging;
    if (changed.has('url')) {
      this.#router.initialize(this.url);
    }
  }

  disconnectedCallback() {
    this.#router?.disable();
    this.#router = null;
  }

  static {
    this.define('gs-router');
  }

}
