/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';

/**
 * For debugging purposes for floating element such as popup, popover, menus... 
 * https://developer.mozilla.org/en-US/docs/Web/CSS/CSSOM_view/Coordinate_systems
 */
export class GSMouselement extends GSElement {

  static properties = {
    pageX: { type: Number },
    pageY: { type: Number },
    screenX: { type: Number },
    screenY: { type: Number },
    clientX: { type: Number },
    clientY: { type: Number },       
    offsetX: { type: Number },       
    offsetY : { type: Number }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.attachEvent(window, 'mousemove', this.#onMouse.bind(this));
  }

  renderUI() {
    const me = this;
    return html`
    Offset(${me.offsetX}, ${me.offsetY}) 
    Viewport(${me.clientX}, ${me.clientY}) 
    Page(${me.pageX}, ${me.pageY}) 
    Screen(${me.screenX}, ${me.screenY})`;
  }

  #onMouse(e) {
    const me = this;
    me.offsetX = e.offsetX;
    me.offsetY = e.offsetY;
    me.clientX = e.clientX;
    me.clientY = e.clientY;
    me.pageX = e.pageX;
    me.pageY = e.pageY;
    me.screenX = e.screenX;
    me.screenY = e.screenY;
  }

  static {
    this.define('gs-mouse');
  }

}