/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GROUP } from '../base/GSConst.mjs';
import { html, ifDefined } from '../lib.mjs';
import { GSGroupElement } from './Group.mjs';

export class GSListElement extends GSGroupElement {

  static properties = {
    selectable: { reflect: true, type: Boolean }
  }

  constructor() {
    super();
    this.circular = false;
    this.multiple = false;
    this.selectable = false;
    this[GROUP] = 'GS-LIST-ITEM';
  }

  shouldUpdate(changed) {
    return this.data.length > 0 || this.items.length > 0;
  }

  renderClass() {
    const css = {
      ...super.renderClass(),
      'list-group': true,
    }
    return css;
  }

  renderWrappedUI() {
    return html`<slot></slot>`;
  }

  reset() {
    super.reset();
    this.items.forEach(el => el.reset());
    this.notify();
  }

  renderItems() {    
    return this.data.map(o => {
      return html`<gs-list-item generated
        .active="${ifDefined(o.active === true)}"
        .autofocus="${ifDefined(o.autofocus === true)}"
        .disabled="${ifDefined(o.disabled === true)}" 
        icon="${ifDefined(o.icon)}" 
        href="${ifDefined(o.href)}" 
        target="${ifDefined(o.target)}" 
        title="${ifDefined(o.title)}"></gs-list-item>`;
    });
  }

  isNavigable(el) {
    return super.isNavigable(el) && this.selectable;
  }
 
  static {
    this.define('gs-list');
  }

}