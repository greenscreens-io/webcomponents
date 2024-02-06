/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSGroupElement class
 * @module components/GSGroupElement
 */

import { GSElement } from '../GSElement.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { ElementNavigationController } from '../controllers/ElementNavigationController.mjs';
import { classMap, createRef, html, ifDefined, ref } from '../lib.mjs';

/**
 * Renderer for grouped elements such as Buttons, Navs, Tabs and lists.
 * Components handles grouped elements navigation, selection and focus.
 * 
 * @class
 * @extends { GSElement }
 */
export class GSGroupElement extends GSElement {

  static properties = {
    storage: {},
    circular: { type: Boolean },
    multiple: { type: Boolean },
    data: { type: Array },
  }

  #elRef = createRef();
  #controller;

  constructor() {
    super();
    this.data = this.initData();
    this.#controller = new ElementNavigationController(this);
  }

  firstUpdated(changed) {
    this.#controller.init();
    this.#controller.attach(this.#elRef.value);
    super.firstUpdated(changed);
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
      <slot name="${ifDefined(name)}">${me.renderItems()}</slot>
      </div>`;
  }

  renderWrappedClass() {
    return {};
  }

  renderItems() {
    return '';
  }

  initData() {
    return undefined;
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
    return true;
  }

  onDataRead(data) {
    this.data = data;
  }

  get focused() {
    return this.#controller.focused;
  }

  get selected() {
    return this.#controller.selected;
  }

  settings(el) {
    const cfg = el instanceof GSElement ? el.definitions : GSElement.allProperties(el);
    const items = Array.from(this.children).filter(e => e.tagName === 'GS-NAV-ITEM' ).map(el => GSAttr.proxify(el, cfg));
    const active = items.filter(el => el.active);
    active.forEach((el, idx) => el.active = idx === 0);
    return items;
  }

  static {
    this.define('gs-group');
  }
}