/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, css, html, ifDefined, createRef, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { notEmpty, numGT0 } from '../properties/index.mjs';
import { color } from '../properties/color.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

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
    clickCss: { attribute : 'click-css'},
    hoverCss: { attribute : 'hover-css'},
    _clicked: { attribute:false},
    _hovered: { attribute:false},
  }

  #ref = createRef();
  
  constructor() {
    super();
    //this.flat = true;
  }

  /*
  firstUpdated() {
    super.firstUpdated();
    this.#embdeded = GSDOM.matches(this.parentComponent, '[icon]');
  }
  */

  updated(changed) {
    if (changed.has('_clicked')) {
      if (this._clicked) this.#postAnimate();
    } 
  }

  renderUI() {
    const me = this;
    me.setCSSProperty(':host', '--gs-icon-super-color', me.superColor);
    return html`<i  ${ref(me.#ref)}
       class="bi ${classMap(me.renderClass())}"
       data-super="${ifDefined(me.super)}"
       @click="${me.animate}"
       @mouseover="${me.#onMouseOver}"
       @mouseout="${me.#onMouseOut}"></i>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      [`text-${me.color}`]: me.color,
      [`bi-${me.name}`]: me.name,
      'fs': me.size > 0,
      [`fs-${me.size}`]: me.size > 0,
      [me.clickCss]: me._clicked,
      [me.hoverCss]: me._hovered,
    }
    return css;
  }

  async #postAnimate() {
    const me = this;
    const delay = GSUtil.asNum(me.dataset.delay, 1);
    if (delay > 0) {
      await GSUtil.timeout(delay * 1000);
      me._clicked = false;
    }    
  }

  #onMouseOver(e) {
    this.hover(true);
  }

  #onMouseOut(e) {
    this.hover(false);
  }

  animate() {
    const me = this;
    me._hovered = false;
    me._clicked = true;
  }

  hover(sts = false) {
    const me = this;
    if (sts) {
      me._clicked = false;
    }
    me._hovered = sts;
  }

  static {
    this.define('gs-icon');
  }

}