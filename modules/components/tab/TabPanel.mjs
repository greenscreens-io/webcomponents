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

  disconnectedCallback() {
    delete this[Symbol.for('gs-element')];
    super.disconnectedCallback();
  }

  shouldUpdate(changedProperties) {
    return this.parentComponent?.tagName === this.parentType;
  }

  /*
  @invalid="${me.#onInvalid}"
  @change="${me.#onChange}"
  */
  renderUI() {
    const me = this;
    return html`<div  
      dir="${ifDefined(me.direction)}" 
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

  get parentType() {
    return 'GS-TAB-GROUP';
  }

  get owner() {
    return this.closest(this.parentType.toLowerCase(), -1, true) || GSDOM.component(this);
  }

  get form() {
    return this.closest('form', -1, true);
  }

  get tab() {
    const me = this;
    const key = Symbol.for('gs-element');
    return me[key] || me.owner.tabByName(me.name);
  }

  get tabs() {
    return this.owner.tabs;
  }

  /*
  #onChange(e) {
    const me = this;
    if (me.form) {
      const isValid = me.form.isValid;
      me.tabs?.forEach(el => el.badge = !isValid);
    }
  }

  #onInvalid(e) {
    const me = this;
    if (me.form) me.badge = false;
  }
  */

  static {
    this.define('gs-tab-panel');
  }

}