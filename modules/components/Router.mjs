/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSID } from '../base/GSID.mjs';
import { GSRouter } from '../base/GSRouter.mjs';
import { GSElement } from '../GSElement.mjs';
import { html } from '../lib.mjs';

export class GSRouterElement extends GSElement {

  #router;
  #activeUrl;

  static properties = {
    url: {},
    disabled: { type: Boolean },
    logging: { type: Boolean }
  };

  constructor() {
    super();
    this.id ||= GSID.next();
    this.logging = false;
  }

  renderUI() {
    return html`<slot></slot>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#router ??= new GSRouter(this);
    this.#router.log = this.logging;
    if (this.disabled) {
      this.#router.disable();
    } else {
      this.#initialize();
    }
  }

  updated(changed) {
    this.#router.log = this.logging;
    if (changed.has('disabled')) {
      if (this.disabled) {
        this.#router.disable();
      } else {
        this.#initialize();
      }
    } else if (changed.has('url') && this.url !== this.#activeUrl && !this.disabled) {
      this.#initialize();
    }
  }

  disconnectedCallback() {
    this.#router?.disable();
    super.disconnectedCallback();
  }

  #initialize() {
    this.#activeUrl = this.url;
    void this.#router.initialize(this.#activeUrl);
  }

  static {
    this.define('gs-router');
  }

}
