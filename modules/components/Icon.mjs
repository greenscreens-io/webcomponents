/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, css, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { notEmpty, numGT0 } from '../properties/index.mjs';
import { color } from '../properties/color.mjs';

export class GSIconElement extends GSElement {

  static styles = css`
    :host {
      --gs-icon-super-color : cornflowerblue;
      --gs-icon-content : '';
    }
    i::after {
      top: -8px;
      font-size: 0.7em;
      position: relative;
      content: var(--gs-icon-content);
      content: attr(data-super);
      color: var(--gs-icon-super-color);
    }`;

  static properties = {
    name: { reflect: true, hasChanged: notEmpty },
    size: { reflect: true, type: Number, hasChanged: numGT0 },
    color: { reflect: true, ...color },
    superColor: { attribute : 'super-color'},
    super: { reflect: true },
  }

  constructor() {
    super();
    //this.flat = true;
  }

  renderUI() {
    const me = this;
    me.setCSSProperty(':host', '--gs-icon-super-color', me.superColor);
    return html`<i class="bi ${classMap(me.renderClass())}" data-super="${ifDefined(me.super)}"></i>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      [`text-${me.color}`]: me.color,
      [`bi-${me.name}`]: me.name,
      'fs': me.size > 0,
      [`fs-${me.size}`]: me.size > 0,
    }
    return css;
  }

  static {
    this.define('gs-icon');
  }

}