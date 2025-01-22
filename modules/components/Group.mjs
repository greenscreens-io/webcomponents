/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSGroupElement class
 * @module components/GSGroupElement
 */

import { GSElement } from '../GSElement.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSAttributeHandler } from '../base/GSAttributeHandler.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { ElementNavigationController } from '../controllers/ElementNavigationController.mjs';
import { GroupController } from '../controllers/GroupController.mjs';
import { classMap, createRef, html, render, ifDefined, ref } from '../lib.mjs';

/**
 * Renderer for grouped elements such as Buttons, Navs, Tabs and lists.
 * Components handles grouped elements navigation, selection and focus.
 * 
 * @class
 * @extends { GSElement }
 */
export class GSGroupElement extends GSElement {

  static properties = {
    // multiple lists with single select across 
    group : {},
    storage: {},    
    circular: { type: Boolean },
    multiple: { type: Boolean },
    data: { type: Array },
  }

  #elRef = createRef();
  #controller;
  #controllerGroup;

  constructor() {
    super();
    const me = this;
    me.data = me.initData();
    me.#controller = new ElementNavigationController(me);
    me.#controllerGroup = new GroupController(me);
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;
    // allow single setting at the container component to apply to the child
    Array.from(me.children).forEach(it => {
      GSAttributeHandler.clone(me, it, false);
    });
  }  


  #prerender() {
    const me = this;
    me.queryAll('[generated]').forEach(el => el.remove());
    if (me.data.length > 0) {
      const items = me.renderItems();
      const tpl = document.createElement('template');
      render(items, tpl);
      Array.of(...tpl.children).forEach(el => GSDOM.appendChild(me, el));
    }
  }
  
  firstUpdated(changed) {
    const me = this;
    me.#controller.init();
    me.#controller.attach(me.#elRef.value);
    super.firstUpdated(changed);
    //me.#prerender();
  }  

  willUpdate(changed) {
    const me = this;
    if (changed.has('data')) {      
      me.#prerender();
    }
    super.willUpdate(changed);
  }

  renderUI() {
    const me = this;
    return html`<div ${ref(me.#elRef)} 
      dir="${ifDefined(me.direction)}"
      class="${classMap(me.renderClass())}">
      ${me.renderWrappedUI()}
      </div>`;
  }

  renderWrappedUI(name) {
    const me = this;
    return html`<div 
      class="${classMap(me.renderWrappedClass())}">
      <slot name="${ifDefined(name)}"></slot>
      </div>`;
  }

  renderWrappedClass() {
    return {};
  }

  renderItems() {
    return '';
  }

  initData() {
    return this.settings(GSItem);
  }

  previous() {
    this.#controller.previous();
  }

  next() {
    this.#controller.next();
  }

  /**
   * Reset focus / selection
   */
  reset() {
    this.#controller.reset();
  }

  /**
   * Element navigation filter where we can select if focused element is navigable
   * @param {*} el 
   * @returns 
   */
  isNavigable(el) {
    return el?.tagName === this.childTagName;
  }

  onDataRead(data) {
    this.data = data;
  }

  onBusEvent(e) {
    let owner, item;  
    ({owner, item} = e.detail);
    if (owner != this) {
      if (!item?.disabled || owner?.selectable) {
        this.reset();
      }
    }
  }
  
  onSelected(el) {
    this.#controllerGroup.notify(el);
  }

  get focused() {
    return this.#controller.focused;
  }

  get selected() {
    return this.#controller.selected;
  }

  get childTagName() {
    return '';
  }
    
  get items() {
    const me = this;
    return me.queryAll(me.childTagName);
  }

  get generated() {
    const me = this;
    return this.queryAll(`${me.childTagName}[generated]`);
  }

  get active() {
    const me = this;
    if (me.multiple) return me.queryAll(`${me.childTagName}[active]`);
    return me.query(`${me.childTagName}[active]`);
  }

  settings(el) {
    const tagName = customElements.getName(el)?.toUpperCase() || 'GS-ITEM';
    const cfg = GSElement.allProperties(el);
    const items = Array.from(this.children).filter(e => e.tagName === tagName ).map(el => GSAttr.proxify(el, cfg));
    const active = items.filter(el => el.active);
    active.forEach((el, idx) => el.active = idx === 0);
    return items;
  }

  static {
    this.define('gs-group');
  }
}