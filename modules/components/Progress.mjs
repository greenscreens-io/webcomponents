/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { html, classMap, styleMap, ifDefined } from '../lib.mjs';
import { literalTemplate } from '../directives/literal.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

export class GSProgressElement extends GSElement {

  static properties = {
    min: { reflect: true, type: Number },
    max: { reflect: true, type: Number },
    step: { reflect: true, type: Number },
    value: { reflect: true, type: Number },
    label: { reflect: true }
  }

  constructor() {
    super();
    this.min = 0;
    this.step = 1;
    this.max = 100;
    this.value = 0;
    this.styles = { width: '0%' };
  }

  renderUI() {
    const me = this;
    me.#updateStyle();
    const obj = {min :me.min, max:me.max, step:me.step, value:me.value, percentage:me.percentage};
    return html`
    <div class="progress" @keydown="${me.#onKeySelect}" dir="${ifDefined(me.direction)}">
        <div class="progress-bar ${classMap(me.renderClass())}" 
             style=${styleMap(me.styles)} 
             role="progressbar"
             tabindex="0">
             ${literalTemplate(me.label, obj)}
        </div>
    </div>    
    `;
  }

  willUpdate(changedProperties) {
    super.willUpdate(changed);
    const me = this;
    if (changedProperties.has('value')) {
      let val = me.step + changedProperties.get('value');
      val = me.#update(val, val);
      changedProperties.set('value', val);
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('value')) {
      this.notify();
    }
  }

  increase(val) {
    const me = this;
    val = GSUtil.isNumber(val) ? val : me.step;
    me.value = me.#update(me.value + val, me.value);
    return true;
  }

  decrease(val) {
    const me = this;
    val = GSUtil.isNumber(val) ? val : me.step;
    me.value = me.#update(me.value - val, me.value);
    return true;
  }

  get percentage() {
    const me = this;
    return Math.trunc((me.value / me.max) * 100);
  }

  #updateStyle() {
    this.styles.width = `${this.percentage}%`;
  }

  #update(val, old = 0) {
    val = GSUtil.asNum(val, GSUtil.asNum(old));
    const me = this;
    if (val > me.max) val = me.max;
    if (val < me.min) val = me.min;
    return val;
  }

  #onKeySelect(e) {
    const me = this;
    switch (e.code) {
      case 'ArrowUp' :
      case 'ArrowRight' :
          return me.increase();
      case 'ArrowLeft' :
      case 'ArrowDown' :
         return me.decrease();
    }
  }

  static {
    this.define('gs-progress');
  }

}