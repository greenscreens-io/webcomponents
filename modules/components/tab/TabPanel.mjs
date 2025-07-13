/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSElement } from '../../GSElement.mjs';
import { GSDOM } from '../../base/GSDOM.mjs';
import { classMap, html, ifDefined } from '../../lib.mjs';

/**
 * Container for individual tab; part of tabed panel
 */
export class GSTabPanelElement extends GSElement {

  static properties = {
    name: {},
    template: {},
    active: { type: Boolean, reflect : true }
  }

  constructor() {
    super();
    this.active = false;
  }

  shouldUpdate(changedProperties) {
    return this.parentComponent?.tagName === 'GS-TAB-GROUP';
  }

  renderUI() {
    const me = this;
    return html`<div  dir="${ifDefined(me.direction)}" 
      class="${classMap(this.renderClass())}">
      <slot>
      ${me.renderTemplate()}
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

  get owner() {
    return this.closest('gs-tab-group') || GSDOM.component(this);
  }

  static {
    this.define('gs-tab-panel');
  }

}