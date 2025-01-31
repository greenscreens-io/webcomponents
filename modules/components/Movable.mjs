/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, css, html, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { color } from '../properties/color.mjs';
import { GSID } from '../base/GSID.mjs';

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

  #styleID = GSID.id;
  #refEl = createRef();
  #enabled = false;

  constructor() {
    super();
    const me = this;
    me.dynamicStyle(me.#styleID);
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;
    const root = document.documentElement;
    me.attachEvent(root, 'mousemove', me.#onMove.bind(me));
    me.attachEvent(root, 'mousedown', me.#onMouseDown.bind(me));
    me.attachEvent(root, 'mouseup', me.#onMouseUp.bind(me));
  }

  firstUpdated() {
    super.firstUpdated();
    const me = this;
    const rule = me.dynamicStyle(me.#styleID);
    Object.assign(rule.style, {cursor: 'move'});
  }

  renderUI() {
    const me = this;
    return html`<div ${ref(me.#refEl)} 
      data-gs-class="${me.#styleID}"
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
      [me.#styleID]: true,
      'position-absolute' : true,
      'border' : me.border,
      'shadow-sm' : me.shadow,
      [`text-${me.color}`]: me.color,
    }
    return css;
  }

  #updateCursor(move) {
    const me = this;
    const rule = me.dynamicStyle(me.#styleID);
    Object.assign(rule.style, {'user-select': move ? 'none' : ''});
  }

  #onMove(e) {
    if (this.#enabled) {
      const style = this.#refEl.value.style;
      style?.setProperty('--mouse-x', e.clientX + "px");
      style?.setProperty('--mouse-y', e.clientY + "px");
    }
  }

  #onMouseDown(e) {
    this.#updateCursor(true);
  }

  #onMouseUp(e) {
    this.#updateCursor(false);
  }


  static {
    this.define('gs-movable');
  }

}