/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { html, classMap, ifDefined } from '../lib.mjs';
import { literalTemplate } from '../directives/literal.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSID } from '../base/GSID.mjs';

export class GSProgressElement extends GSElement {

  static properties = {
    min: { reflect: true, type: Number },
    max: { reflect: true, type: Number },
    step: { reflect: true, type: Number },
    value: { reflect: true, type: Number },
    label: { reflect: true }
  }

  #styleID = GSID.id;

  constructor() {
    super();
    this.min = 0;
    this.step = 1;
    this.max = 100;
    this.value = 0;
    this.styles = { width: '0%' };
    this.dynamicStyle(this.#styleID);
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'progress-bar' : true,
      [me.#styleID] : true
    }
    return css;
  }  

  renderUI() {
    const me = this;
    me.#updateStyle();
    const obj = {min :me.min, max:me.max, step:me.step, value:me.value, percentage:me.percentage};
    return html`
    <div class="progress" @keydown="${me.#onKeySelect}" dir="${ifDefined(me.direction)}">
        <div class="${classMap(me.renderClass())}" 
             
             role="progressbar"
             tabindex="0">
             ${literalTemplate(me.label, obj)}
        </div>
    </div>    
    `;
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const me = this;
    if (changed.has('value')) {
      let val = me.step + changed.get('value');
      val = me.#update(val, val);
      changed.set('value', val);
    }
  }

  updated(changed) {
    if (changed.has('value')) {
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
    const me = this;
    me.styles.width = `${me.percentage}%`;
    me.dynamicStyle(me.#styleID, me.styles);
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