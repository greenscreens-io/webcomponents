/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSNavItemElement } from '../NavItem.mjs';

export class GSTabItemElement extends GSNavItemElement {

  static properties = {
    name: {}
  }

  shouldUpdate(changedProperties) {
    return this.owner?.tagName === 'GS-TAB-GROUP';
  }

  static {
    this.define('gs-tab');
  }

}