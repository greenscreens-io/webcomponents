/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from '../../GSElement.mjs';
import { GSDOM } from '../../base/GSDOM.mjs';
import { classMap, html, ifDefined } from '../../lib.mjs';

export class GSTabPanelElement extends GSElement {

  static properties = {
    name: {},
    template: {},
    active: { type: Boolean }
  }

  constructor() {
    super();
  }

  shouldUpdate(changedProperties) {
    return GSDOM.component(this)?.tagName === 'GS-TAB-GROUP';
  }

  renderUI() {
    return html`<div  dir="${ifDefined(me.direction)}" 
      class="${classMap(this.renderClass())}">
      <slot>
      ${this.template ? html`<gs-template url="${this.template}"></gs-template>` : ''}
      </slot></div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'tab-pane': true,
      'd-none' : !me.active,
    }
    return css;
  }

  static {
    this.define('gs-tab-panel');
  }

}