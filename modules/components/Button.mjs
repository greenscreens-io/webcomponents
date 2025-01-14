/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { classMap, ifDefined, html, ref, createRef } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { color, size, buttonType, ButtonTypes, SizeTypes } from '../properties/index.mjs';

export class GSButtonElement extends GSElement {

  static properties = {
    type: { ...buttonType }, // reset, submit
    size: { ...size }, // small, large, normal
    color: { ...color },
    clickCss: { attribute : 'click-css'},
    hoverCss: { attribute : 'hover-css'},
    toggleColor: { ...color, attribute : 'toggle-color' },
    autofocus: { type: Boolean },
    disabled: { type: Boolean, reflect: true },
    outline: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true },
    toggling: { type: Boolean },
    icon: {},
    title: {},
    tooltip: {},
    text: {}
  };

  #refEl = createRef();
  #refIco = createRef();

  constructor() {
    super();
    this.type = 'button';
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    if (this.autofocus && !this.disabled) this.focus();
  }

  renderUI() {
    const me = this;
    return html`<button part="button" role="button" ${ref(me.#refEl)}
        dir="${ifDefined(me.direction)}"
        type="${ifDefined(me.type)}" 
        class="btn ${classMap(me.renderClass())}" 
        title="${ifDefined(me.#tooltip)}"
        ?disabled=${me.disabled}
        @mouseover="${me.#onMouseOver}"
        @mouseout="${me.#onMouseOut}"
        @click="${me.#onClick}">
          ${me.#first} ${me.#second}</button>`;
  }

  renderClass() {
    const me = this;
    const size = SizeTypes[me.size];
    const css = {
      ...super.renderClass(),
      'active': me.active,
      'focus-ring': document.activeElement === me,
      [`text-${me.text}`]: me.text,
      [`btn-${size}`]: size,
      [`btn-outline-${me.color}`]: me.outline,
      [`btn-${me.color}`]: !me.outline && me.color,
      [`btn-${me.toggleColor}`]: me.active && me.toggleColor,
    }
    return css;
  }

  click() {
    this.#refEl.value?.click();
  }

  focus() {
    requestAnimationFrame(() => this.#refEl.value?.focus());
  }

  toggle() {
    this.active = !this.active;
  }

  #onClick(e) {
    const me = this;
    if(me.toggling) me.toggle();
    me.iconEl?.animate();
    if (me.isReset) return me.form?.reset();
    if (me.isSubmit) return me.form?.submit();
    me.notify();
  }

  #onMouseOver() {
    this.iconEl?.hover(true);
  }

  #onMouseOut() {
    this.iconEl?.hover(false);
  }

  get isReset() {
    return ButtonTypes.isReest(this.type);
  }

  get isSubmit() {
    return ButtonTypes.isSubmit(this.type);
  }

  get iconEl() {
    return this.#refIco.value;
  }

  get form() {
    return this.closest('gs-form, form');
  }

  get #title() {
    return this.translate(this.title);
  }

  get #tooltip() {
    return this.translate(this.tooltip);
  }

  get #first() { return this.rtl ? this.#title : this.#iconHtml; };

  get #second() { return this.rtl ? this.#iconHtml : this.#title; };

  get #iconHtml() { return this.icon ? this.#renderIcon : html`<slot name="icon"></slot>`; }

  get #renderIcon() {
    return  html`
    <gs-icon ${ref(this.#refIco)} 
    name="${this.icon}" 
    click-css="${ifDefined(this.clickCss)}" 
    hover-css="${ifDefined(this.hoverCss)}" 
    data-delay="1"></gs-icon>`;
  }

  static {
    this.define('gs-button');
  }

}
