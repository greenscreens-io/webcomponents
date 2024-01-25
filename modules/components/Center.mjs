/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';

export class GSCenterElement extends GSElement {

  constructor() {
    super();
  }

  renderUI() {
    return html`<div  dir="${ifDefined(me.direction)}"
      class="position-absolute top-50 start-50 translate-middle ${classMap(this.renderClass())}">
    ${this.renderTemplate()}<slot></slot></div>`;
  }

  static {
    this.define('gs-center');
  }

}