/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { KEY } from '../../base/GSConst.mjs';
import { GSUtil } from '../../base/GSUtil.mjs';
import { GSNavItemElement } from '../NavItem.mjs';

/**
 * Tab component (gs-tab-header), generate selectable/switchable tabs on a panel
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
    return me.shouldUpdate() ? GSUtil.normalize(me.parentComponent?.tabCSS) : '';
  }

  get parentType() {
    return 'GS-TAB-GROUP';
  }

  get panel() {
    const me = this;
    return me[KEY] || me.owner.panelByName(me.name);
  }

  static {
    this.define('gs-tab-header');
  }

}