/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, css, html, ifDefined, styleMap } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { placement, PlacementTypes } from '../properties/placement.mjs';

export class GSCardElement extends GSElement {

  static styles = css`.card-header, .card-footer{ background-color: inherit; color: inherit;}`;

  static properties = {

    imageStyle: { type: Object, attribute: 'image-style', reflect : true },

    overlay: { type: Boolean },
    placement: { ...placement },
    align: { ...placement },

    image: {},
    title: {},
    subtitle: {},
    text: {},
    footer: {},
    header: {},

    colorText: { attribute: 'color-text' },
    colorBack: { attribute: 'color-back' },
    colorBorder: { attribute: 'color-border' },

    cssTitle: { attribute: 'css-title' },
    cssSubtitle: { attribute: 'css-subtitle' },
    cssText: { attribute: 'css-text' },
    cssFooter: { attribute: 'css-footer' },
    cssHeader: { attribute: 'css-header' },
    cssBody: { attribute: 'css-body' },
    cssImage: { attribute: 'css-image' },

  }

  constructor() {
    super();
    this.border = false;
    this.shadow = false;
    this.align = 'start';
    this.placement = 'top';
    this.imageStyle = this.imageStyle || {};
  }

  renderUI() {
    const me = this;
    const content =  me.isVertical ? me.#renderVertical() : me.#renderHorizontal();
    return html`<div  dir="${ifDefined(me.direction)}" class="card ${classMap(me.renderClass())}">${content}</div>`;
  }

  #renderVertical() {
    const me = this;
    return [me.#imageTop, me.#header, me.#body, me.#footer, me.#imageBottom];
  }

  #renderHorizontal() {
    const me = this;
    const start = PlacementTypes.isBefore(me.placement);
    const startClass = start ? 'col-4' : 'col-8';
    const endClass = start ? 'col-8' : 'col-4';
    const startHtml = start ? me.#images : me.#body;
    const endHtml =  start ? me.#body : me.#images;
    return html`<div class="row g-0">
        <div class="${startClass}">
            ${startHtml}
        </div>
        <div class="${endClass}">
          ${endHtml}
        </div>
      </div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      border: me.border || me.colorBorder,
      [`text-${me.align}`]: me.align,
      [`text-${me.colorText}`]: me.colorText,
      [`bg-${me.colorBack}`]: me.colorBack,
      [`border-${me.colorBorder}`]: me.colorBorder,
    }
    return css;
  }

  get isVertical() {
    return PlacementTypes.isVertical(this.placement);
  }

  get isHorizontal() {
    return PlacementTypes.isHorizontal(this.placement);
  }

  get #body() {
    const me = this;
    return html`<div class="${me.overlay ? 'card-img-overlay' : 'card-body'} ${me.cssBody}">
      <h5 class="card-title  ${me.cssTitle}"><slot name="title">${me.translate(title)}</slot></h5>
      <h6 class="card-subtitle  ${me.cssSubtitle}"><slot name="subtitle">${me.translate(me.subtitle)}</slot></h6>
      <p class="card-text ${me.cssText}"><slot name="text">${me.translate(me.text)}</slot></p>
      <slot name="body"></slot>
    </div>    
    `;
  }

  get #header() {
    return this.overlay ? '' : html`<div class="card-header  ${this.cssHeader}"><slot name="header">${this.header}</slot></div>`;
  }

  get #footer() {
    return this.overlay ? '' : html`<div class="card-footer ${this.cssFooter}"><slot name="footer">${this.footer}</slot></div>`;
  }

  get #imageSlot() {
    return html`<slot name="image"></slot>`;
  }

  get #image() {
    const css = this.isHorizontal ? 'img-fluid' : 'card-img';
    return html`<img src="${this.image}" class="rounded-${this.placement} ${css} ${this.cssImage}" style=${styleMap(this.imageStyle)} alt="...">`;
  }

  get #images() {
    return this.image ? this.#image : this.#imageSlot;
  }

  get #imageTop() {
    return this.placement === 'top' ? this.#images : '';
  }

  get #imageBottom() {
    return this.placement === 'bottom' ? this.#images : '';
  }

  static {
    this.define('gs-card');
  }

}