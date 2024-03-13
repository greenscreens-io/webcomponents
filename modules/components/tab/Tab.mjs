/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSUtil } from '../../base/GSUtil.mjs';
import { GSNavItemElement } from '../NavItem.mjs';

/**
 * Tab component (gs-tab), generate selectable/switchable tabs on a panel
 */
export class GSTabItemElement extends GSNavItemElement {

  static properties = {
    name: {}
  }

  constructor() {
    super();
    this.css = this.#updateCSS + this.css;
  }

  get #updateCSS() {
    const me = this;
    return me.shouldUpdate() ? GSUtil.normalize(me.parentElement?.tabCSS) : '';
  }

  shouldUpdate(changed) {
    return this.owner?.tagName === 'GS-TAB-GROUP';
  }

  static {
    this.define('gs-tab');
  }

}