/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { html, ifDefined } from '../lib.mjs';
import { GSGroupElement } from './Group.mjs';
import { GSListItemElement } from './ListItem.mjs';

export class GSListElement extends GSGroupElement {

  static properties = {
    selectable: { reflect: true, type: Boolean },
    data: { type: Array },
  }

  constructor() {
    super();
    this.circular = false;
    this.multiple = false;
    this.selectable = false;
  }

  initData() {
    return this.settings(GSListItemElement);
  }

  shouldUpdate(changed) {
    return this.data.length > 0 || this.query('gs-list-item');
  }

  renderClass() {
    const css = {
      ...super.renderClass(),
      'list-group': true,
    }
    return css;
  }

  renderWrappedUI() {
    return html`<slot>${this.renderItems()}</slot>`;
  }

  reset() {
    this.items.forEach(el => el.reset());
    this.notify();
  }

  renderItems() {
    const me = this;
    return this.data.map(o => {
      return html`<gs-list-item generated
        .active="${o.active === true}"
        .autofocus="${o.autofocus === true}"
        .disabled="${ifDefined(o.disabled === true)}" 
        icon="${ifDefined(o.icon)}" 
        href="${ifDefined(o.href)}" 
        target="${ifDefined(o.target)}" 
        title="${ifDefined(o.title)}"></gs-list-item>`;
    });
  }

  isNavigable(el) {
    return el?.tagName === 'GS-LIST-ITEM';
  }

  get items() {
    return this.queryAll('gs-list-item');
  }

  static {
    this.define('gs-list');
  }

}