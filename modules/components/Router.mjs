/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSID } from '../base/GSID.mjs';
import { GSRouter } from '../base/GSRouter.mjs';
import { GSElement } from '../GSElement.mjs';
import { html } from '../lib1.mjs';

export class GSRouterElement extends GSElement {

  #router = null;

  static properties = {
    url: {},
    disabled: { type: Boolean },
    logging: { type: Boolean }
  };

  constructor() {
    super();
    const me = this;
    me.id = GSID.next();
    me.logging = false;
    me.#router = new GSRouter(me);
    me.#router.log = false;
  }

  renderUI() {
    //return super.renderUI();
    return html`<slot><slot/>`;
  }

  updated(changed) {
    const me = this;
    me.#router.log = me.logging;
    if (changed.has('url')) {
      me.#router.initialize(me.url);
    }
  }

  disconnectedCallback() {
    const me = this;
    me.#router?.disable();
    me.#router = null;
  }

  static {
    this.define('gs-router');
  }

}
