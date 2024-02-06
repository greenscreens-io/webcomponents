/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSItem } from '../base/GSItem.mjs';

export class GSAccordionElement extends GSElement {

  static properties = {
    storage: {},
    autoclose: { type: Boolean },
    cssItem: { reflect: true, attribute: 'css-item' },
    cssHeader: { reflect: true, attribute: 'css-header' },
    cssBody: { reflect: true, attribute: 'css-body' },
    data: { type: Array }
  }

  constructor() {
    super();
    this.data = this.settings;
  }

  renderUI() {
    const me = this;
    return html`<div  dir="${ifDefined(me.direction)}"
       @notify="${me.#onNotify.bind(me)}"
       @click="${me.#onClick}" 
       @keyup="${me.#onKeyUp}" 
       class="accordion ${classMap(me.renderClass())}">
       ${this.#renderItems()}
       <slot></slot></div>`
  }

  get items() {
    return this.queryAll('gs-accordion-item');
  }

  get settings() {
    const cfg = this.constructor.properties;
    return GSItem.collect(this).map(el => GSAttr.proxify(el, cfg));
  }

  close() {
    this.#state(false);
  }

  open() {
    this.#state(true);
  }

  onDataRead(data) {
    this.data = data;
  }

  #renderItems() {
    return this.data.map(o => {
      return html`<gs-accordion-item generated
        .opened="${ifDefined(o.disabled === true)}" 
        message="${ifDefined(o.message)}" 
        template="${ifDefined(o.template)}" 
        title="${ifDefined(o.title)}"></gs-accordion-item>`;
    });
  }

  #state(val = false) {
    this.items.forEach(el => el.opened = val);
    this.notify();
  }

  #onNotify(e) {
    const me = this;
    if (me.autoclose && e.target.opened) {
      me.items.filter(el => el != e.target).forEach(el => el.opened = false);
    }
  }

  #onClick(e) {
    const isItemCloser = e?.composedPath()[0]?.matches('.accordion-button');
    if(isItemCloser) e.target.toggle?.();
  }

  #onKeyUp(e) {
    switch (e.code) {
      case 'ArrowLeft':
        e.target.close?.();
        break;
      case 'ArrowRight':
        e.target.open?.();
        break;
    }
  }

  static {
    this.define('gs-accordion');
  }

}