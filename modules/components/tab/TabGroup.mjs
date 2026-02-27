/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { html, ifDefined } from '../../lib.mjs';
import { GSID } from '../../base/GSID.mjs';
import { KEY, GROUP } from '../../base/GSConst.mjs';
import { PlacementTypes } from '../../properties/placement.mjs';
import { GSNavElement } from '../Nav.mjs';

/**
 * Panel with tabs component (gs-tab-group), generate childrens gs-tab-header and gs-tab-panel 
 */
export class GSTabGroupElement extends GSNavElement {

  static properties = {
    panelCSS: { attribute: 'css-panel' },
    tabCSS: { attribute: 'css-tab' },
  }

  constructor() {
    super();
    this[GROUP] = 'GS-TAB-HEADER';
  }
   
  firstUpdated(changed) {
    super.firstUpdated(changed);
    const me = this;
    // link tabs and panels
    me.items.forEach(el => me.#findPanel(el));
    me.onSelected(me.active);
  }

  shouldUpdate(changed) {
    return this.data.length > 0 || this.items.length > 0;
  }

  willUpdate(changed) {
    const me = this;
    if (changed.has('data')) {      
      me.items.forEach(el => me.#findPanel(el));
    }
    super.willUpdate(changed);
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
    const me = this;
    const tabs =  me.#renderTabs();
    const panels = me.#renderPanels();
    return tabs.concat(...panels);
  }

  #renderTabs() {    
    return this.data.map(o => {
      if (!o.name) o.name = GSID.id;
      return html`<gs-tab-header generated slot="tabs"
        .active="${ifDefined(o.active === true)}"
        .autofocus="${ifDefined(o.autofocus === true)}"
        .disabled="${ifDefined(o.disabled === true)}" 
        icon="${ifDefined(o.icon)}"
        title="${ifDefined(o.title)}"
        name="${o.name}"></gs-tab-header>`;
    });    
  }

  /**
   * Render items based on data property (might be from gs-item)
   * @returns 
   */
  #renderPanels() {
    return this.data.map(o => {
      if (!o.name) o.name = GSID.id;
      return html`<gs-tab-panel generated  
        slot="panels" name="${o.name}" 
        .active="${ifDefined(o.active)}"
        template="${ifDefined(o.template)}"></gs-tab-panel>`;
    });
  }

  #updatePanelState(el, state = false) {
    const panel = this.#findPanel(el);
    if (panel) panel.active = state;    
  }


  /**
   * Callback when tab selected
   * @param {GSTabElement} el 
   */
  onSelected(el) {
    this.#updatePanelState(el, true);
  }

  /**
   * Callback when tab deselected
   * @param {GSTabElement} el 
   */
  onDeselected(el) {
    this.#updatePanelState(el, false);
  }

  get tabs() {
    return this.items;
  }

  get panels() {
    return this.queryAll('gs-tab-panel', false, true);
  }

  reset() {
    const me = this;
    me.panels.forEach((el, idx) => el.active = idx === 0 ? true : false);
    me.tabs.forEach((el, idx) => el.active = idx === 0 ? true : false);
    super.reset();
  }

  clear() {
    this.tabs.forEach(t => t.badge = false);
  }

  tabByName(name = '', shadow = false) {
    return this.query(`gs-tab-header[name="${name}"]`, shadow, true);
  }

  panelByName(name = '', shadow = false) {
    return this.query(`gs-tab-panel[name="${name}"]`, shadow, true);
  }

  /**
   * Selected Tab node name is used to find the panel.
   * If panel found, auto-link it with node element
   * @param {GSTabElement} el 
   */
  #findPanel(el) {
    if (!el) return null;
    const me = this;
    const generated = me.data?.length > 0;
     let panel = el[KEY] || me.panelByName(el.name, generated);
    if (panel && !el[KEY]) {
      el[KEY] = panel;
      panel[KEY] = el;
    }
    return panel;
  }

  static {
    this.define('gs-tab-group');
  }

}