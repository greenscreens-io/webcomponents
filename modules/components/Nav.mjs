/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { html, ifDefined } from '../lib.mjs';
import { GSGroupElement } from './Group.mjs';
import { GSNavItemElement } from './NavItem.mjs';
import { PlacementTypes, nav, placement } from '../properties/index.mjs';

export class GSNavElement extends GSGroupElement {

  static properties = {
    type: nav,
    placement: placement,
    vertical: { type: Boolean }
  }

  constructor() {
    super();
    this.circular = true;
    this.multiple = false;
    this.type = 'pills';
    this.placement = 'start';
  }

  initData() {
    return this.settings(GSNavItemElement);
  }

  shouldUpdate(changed) {
    return this.data.length > 0 || this.query('gs-nav-item');
  }
  
  renderWrappedClass() {
    const me = this;
    const isBefore = PlacementTypes.isBefore(me.placement);
    const isTab = me.type === 'tabs';
    const css = {
      'nav': true,
      [`nav-${me.type}`]: me.type,
      'flex-column': me.vertical,
      'border-bottom-0': me.vertical,
      'border-end': isTab && isBefore && me.vertical,
      'border-start': isTab && !isBefore && me.vertical,
      [`justify-content-${me.placement}`]: !me.vertical
    }
    return css;
  }

  /**
   * Render items based on data propprty (might be from gs-item)
   * @returns 
   */
  renderItems() {
    return this.data.map(o => {
      return html`<gs-nav-item generated
        .active="${o.active === true}"
        .autofocus="${o.autofocus === true}"
        .disabled="${ifDefined(o.disabled === true)}" 
        icon="${ifDefined(o.icon)}" 
        href="${ifDefined(o.href)}" 
        target="${ifDefined(o.target)}" 
        title="${ifDefined(o.title)}"></gs-nav-item>`;
    });
  }

  isNavigable(el) {
    return el?.tagName === 'GS-NAV-ITEM';
  }

  /**
   * Callback when child element focused
   * @param {*} el 
   */
  onFocused(el) {
    // el?.click();
  }

  static {
    this.define('gs-nav');
  }

}