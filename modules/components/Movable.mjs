/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, css, html, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { color } from '../properties/color.mjs';

/**
 * This component allow moving contained elements acroos UI
 */
export class GSMovableElement extends GSElement {

  static styles = css`
  :host {
      --gs-width : inherited;
      --gs-height : inherited;
      --gs-min-width: inherited;
      --gs-max-width: inherited;
      --gs-min-height: inherited;
      --gs-max-height: inherited;
  }
  .gs-movable {
    left: var(--mouse-x) !important;
    top: var(--mouse-y) !important;
   }`;

  static properties = {
    shadow: { type: Boolean},
    border: { type: Boolean},
    color: { reflect: true, ...color }
  }

  #refEl = createRef();
  #enabled = false;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;
    const root = document.documentElement;
    me.attachEvent(root, 'mousemove', me.#onMove.bind(me));
  }

  renderUI() {
    const me = this;
    return html`<div ${ref(me.#refEl)} 
      class="${classMap(me.renderClass())}"
      @mousedown="${() => me.#enabled = true}"
      @mouseup="${() => me.#enabled = false}">
      <slot></slot>
      </div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'gs-movable' : true,
      'position-absolute' : true,
      'border' : me.border,
      'shadow-sm' : me.shadow,
      [`text-${me.color}`]: me.color,
    }
    return css;
  }

  #onMove(e) {
    if (this.#enabled) {
      const style = this.#refEl.value.style;
      style?.setProperty('--mouse-x', e.clientX + "px");
      style?.setProperty('--mouse-y', e.clientY + "px");
    }
  }

  static {
    this.define('gs-movable');
  }

}