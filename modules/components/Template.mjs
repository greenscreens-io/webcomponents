/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { notEmpty } from '../properties/index.mjs';

export class GSTemplateElement extends GSElement {

  static properties = {
    src: { reflect: true, hasChanged: notEmpty }
  }

  constructor() {
    super();
  }

  createRenderRoot() {
    const me = this;
    if (me.flat) {
      me.renderOptions.renderBefore = me;
      return me.parentElement;
    }
    return super.createRenderRoot();
  }

  renderUI() {
    return html`${this.renderTemplate()}`;
  }

  static {
    this.define('gs-template');
  }

}