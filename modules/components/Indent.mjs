/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { css, html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { numGT0 } from '../properties/index.mjs';

export class GSIndentElement extends GSElement {

  static styles = css`.indent {
      --gs-indent : 10px;
      margin-left: var(--gs-indent);
      margin-right: var(--gs-indent);
    }`;

  static properties = {
    flat: { type: Boolean },
    size: { type: Number, hasChanged: numGT0 },
    multiplier: { type: Number, hasChanged: numGT0 }
  }

  constructor() {
    super();
    const me = this;
    me.size = 1;
    me.multiplier = 10;
  }

  renderUI() {
    const size = this.size * this.multiplier;
    return html`<span class="indent" style="--gs-indent: ${size}px;"></span>`;
  }

  static {
    this.define('gs-indent');
  }

}