/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSID } from '../../base/GSID.mjs';
import { html, ifDefined } from '../../lib.mjs';
import { PlacementTypes } from '../../properties/placement.mjs';
import { GSNavElement } from '../Nav.mjs';
import { GSTabItemElement } from './Tab.mjs';

/**
 * Panel with tabs component (gs-tab-group), generate childrens gs-tab and gs-tab-panel 
 */
export class GSTabGroupElement extends GSNavElement {

  static properties = {
    panelCSS: { attribute: 'css-panel' },
    tabCSS: { attribute: 'css-tab' },
  }

  constructor() {
    super();
    const me = this;
    // link tabs and panels
    me.queryAll('gs-tab').forEach(el => me.#findPanel(el));
  }

  initData() {
    return this.settings(GSTabItemElement);
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    const me = this;
    const tabEl = me.query('gs-tab[active],gs-tab[autofocus],gs-tab');
    me.onSelected(tabEl);
  }

  shouldUpdate(changed) {
    return this.data.length > 0 || this.query('gs-tab');
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'd-flex': me.vertical
    }
    return css;
  }

  renderWrappedUI() {
    const me = this;
    const reverse = PlacementTypes.isAfter(me.placement);
    const list = [super.renderWrappedUI('tabs'),
    html`<div class="tab-content flex-fill ${me.panelCSS}"  dir="${ifDefined(me.direction)}">
        <slot name="panels"></slot>
      </div>
      <slot class="d-none"></slot>`];
    return reverse ? list.reverse() : list;
  }

  renderWrappedClass() {
    const me = this;
    const css = super.renderWrappedClass();
    return me.mapCSS(me.tabCSS, css);
  }

  /**
   * Render items based on data property (might be from gs-item)
   * @returns 
   */
  renderItems() {
    return this.data.map(o => {
      if (!o.name) o.name = GSID.id;
      return html`<gs-tab generated
        .active="${o.active}"
        .autofocus="${o.autofocus || o.active}"
        .disabled="${ifDefined(o.disabled)}" 
        icon="${ifDefined(o.icon)}"    
        title="${ifDefined(o.title)}"
        name="${o.name}"></gs-tab>`;
    });
  }

  /**
   * Render items based on data property (might be from gs-item)
   * @returns 
   */
  renderPanels() {
    return this.data.map(o => {
      if (!o.name) o.name = GSID.id;
      return html`<gs-tab-panel name="${o.name}" 
        template="${ifDefined(o.template)}"></gs-tab-panel>`;
    });
  }

  /**
   * Filter navigable element
   * @param {HTMLElement} el 
   */
  isNavigable(el) {
    return el?.tagName === 'GS-TAB';
  }

  /**
   * Callback when tab selected
   * @param {GSTabElement} el 
   */
  onSelected(el) {
    el?.click();
    const panel = this.#findPanel(el);
    if (panel) panel.active = true;
  }

  /**
   * Callback when tab deselected
   * @param {GSTabElement} el 
   */
  onDeselected(el) {
    const panel = this.#findPanel(el);
    if (panel) panel.active = false;
  }

  /**
   * Selected Tab node name is used to find the panel.
   * If panel found, auto-link it with node element
   * @param {GSTabElement} el 
   */
  #findPanel(el) {
    if (!el) return null;
    const me = this;
    const key = Symbol.for('gs-element');
    const generated = false; // me.data?.length > 0;
    let panel = el[key] || me.query(`gs-tab-panel[name="${el.name}"]`, generated);
    if (!el[key]) el[key] = panel;
    return panel;
  }

  static {
    this.define('gs-tab-group');
  }

}