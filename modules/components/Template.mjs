/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { notEmpty } from '../properties/index.mjs';

export class GSTemplateElement extends GSElement {

  static properties = {
    url: { reflect: true, hasChanged: notEmpty }
  }

  constructor() {
    super();
  }

  renderUI() {
    return html`${this.renderTemplate()}`;
  }

  static {
    this.define('gs-template');
  }

}