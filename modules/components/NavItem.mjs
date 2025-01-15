/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, ifDefined, html, createRef, ref } from '../lib.mjs';
import { NavTypes, PlacementTypes } from '../properties/index.mjs';
import { GSElement } from '../GSElement.mjs';

export class GSNavItemElement extends GSElement {

  static properties = {
    href: {},
    target: {},
    title: {},
    icon: {},
    disabled: { type: Boolean },
    autofocus: { type: Boolean },
    active: { type: Boolean, reflect: true }
  }

  #refEl = createRef();

  constructor() {
    super();
  }

  shouldUpdate(changedProperties) {
    return this.parentComponent?.tagName === 'GS-NAV';
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    if (this.autofocus && !this.disabled) this.focus();
  }

  renderUI() {
    const me = this;
    return html`<div class="nav-item ${classMap(me.renderClass())}">${me.#button}</div>`;
  }

  renderClass() {
    return this.mapCSS(this.#itemsCSS, super.renderClass());
  }

  reset() {
    this.active = this.autofocus || false;
  }

  click() {
    this.#refEl.value?.click();
  }

  focus() {
    requestAnimationFrame(() => this.#refEl.value?.focus());
  }

  get isNav() {
    return true;
  }

  get vertical() {
    return this.parentComponent.vertical || false;
  }

  get placement() {
    return this.parentComponent.placement;
  }

  get url() {
    return this.href && this.target ? this.href : '#';
  }

  get #title() {
    return html`<slot>${this.translate(this.title)}</slot>`;
  }

  get #icon() {
    return this.icon ? html`<gs-icon name="${this.icon}"></gs-icon>` : html`<slot name="icon"></slot>`;
  }

  get #first() {
    return this.rtl ? this.#title : this.#icon;
  }

  get #second() {
    return this.rtl ? this.#icon : this.#title;
  }

  get #button() {
    const me = this;
    let obj = me.mapCSS(me.#buttonCSS, {});
    if (me.active) obj = me.mapCSS(me.#buildCSS + ' ' + me.#activeCSS, obj);
    return html`<a tabindex="0" type="button" role="nav" 
     ${ref(me.#refEl)}
     class="nav-link ${classMap(obj)}"
     href="${ifDefined(me.url)}" 
     target="${ifDefined(me.target)}">
        ${me.#first} 
        ${me.#second}
      </a>`;
  }

  get #itemsCSS() {
    return this.parentComponent.dataset?.cssItem || '';
  }

  get #buttonCSS() {
    return this.parentComponent.dataset?.cssButton || '';
  }

  get #activeCSS() {
    return this.parentComponent.dataset?.cssActive || '';
  }

  get #navType() {
    return NavTypes.indexOf(this.parentComponent.type);
  }

  // fiix for shadowed DOM, parent class="nav nav-pills.." 
  // do not cross shadow dom, so item elements does not see CSS
  // we have to simulate
  get #buildCSS() {
    const isVertical = this.vertical;
    const isBefore = PlacementTypes.isBefore(this.placement);
    switch (this.#navType) {
      // pills
      case 1: return 'rounded text-bg-primary';
      // tabs
      case 2:
        if (isVertical) {
          if (isBefore) {
            return 'shadow-none border border-end-0';
          } else {
            return 'shadow-none border border-start-0';
          }
        }
        return 'shadow-none border border-bottom-0';
      // underline
      case 3: return 'shadow-none border-bottom border-3 fw-medium';
      default:
        return '';
    }
  }

  static {
    this.define('gs-nav-item');
  }

}