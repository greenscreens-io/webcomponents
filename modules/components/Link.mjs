/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, ifDefined, html, createRef, ref } from '../lib.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSElement } from '../GSElement.mjs';
import { color } from '../properties/index.mjs';
import { dataset } from '../directives/dataset.mjs';

export class GSLinklement extends GSElement {

  static properties = {
    autofocus: { type: Boolean },
    disabled: { type: Boolean, reflect: true },
    size: { type: Number },
    text: { ...color },
    color: { ...color },
    url: {},
    ping: {},
    icon: {},
    title: {},
    tooltip: {},
    target: {}
  };

  #refEl = createRef();

  constructor() {
    super();
    this.url = '#';
    // this.text = 'primary'; // do not set as default -> gs-dropdown
    // this.target = '_blank'; // not used 
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    if (this.autofocus && !this.disabled) this.focus();
  }

  renderUI() {
    const me = this;
    return html`
      <a ${ref(me.#refEl)}  
        dir="${ifDefined(me.direction)}"
        title="${ifDefined(me.translate(me.tooltip))}" 
        href="${ifDefined(me.url)}" 
        ping="${ifDefined(me.ping)}" 
        target="${ifDefined(me.target)}"
        class="${classMap(me.renderClass())}" 
        ?disabled=${me.disabled} 
        @click="${me.#onClick}">
        ${me.#first}${me.#second}
        </a>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'active': me.active,      
      [`fs-${me.size}`]: me.size > 0,
      [`text-${me.text}`]: me.text,
      [`bg-${me.color}`]: me.color
    }
    return css;
  }

  click() {
    this.#refEl.value?.click();
  }

  focus() {
    requestAnimationFrame(() => this.#refEl.value?.focus());
  }

  #onClick(e) {
    const me = this;
    me.notify();
    if (me.url === '#' || GSUtil.isStringEmpty(me.url)) {
      GSEvents.prevent(e);
      me.handle(e);
      return false;
    }
  }

  get #title() {
    return this.translate(this.title);
  }

  get #first() { return this.rtl ? this.#title : this.#icon; };

  get #second() { return this.rtl ? this.#icon : this.#title; };

  get #icon() { return this.icon ? html`<gs-icon css="mx-1" name="${this.icon}" size="${this.size}"></gs-icon>` : html`<slot name="icon"></slot>`; }

  /**
   * Generate clickable link
   * @param {*} options 
   * @param {*} css 
   * @param {*} before 
   * @param {*} after 
   * @returns 
   */
  static generate(options, css, before, after) {
    const opt = options;
    return html`<a class="${classMap(css)}"
        tabindex="0"    
        ${dataset(opt, true)}
        part="${ifDefined(opt.part)}"
        tooltip="${ifDefined(opt.tooltip)}"
        href="${ifDefined(opt.url)}">        
        ${before || ''}
        <slot>${opt.title}</slot> 
        ${after || ''}
    </a>`;
  }

  static {
    this.define('gs-link');
  }

}
