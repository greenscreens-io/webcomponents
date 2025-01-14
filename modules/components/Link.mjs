/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, ifDefined, html, createRef, ref } from '../lib.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSElement } from '../GSElement.mjs';
import { color } from '../properties/index.mjs';
import { dataset } from '../directives/dataset.mjs';

export class GSLinklement extends GSElement {

  static properties = {
    clickCss: { attribute : 'click-css'},
    hoverCss: { attribute : 'hover-css'},
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
  #refIco = createRef();

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
        @mouseover="${me.#onMouseOver}"
        @mouseout="${me.#onMouseOut}"        
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

  get iconEl() {
    return this.#refIco.value;
  }

  #onClick(e) {
    const me = this;
    me.iconEl?.animate();
    me.notify();
    if (me.url === '#' || GSUtil.isStringEmpty(me.url)) {
      GSEvents.prevent(e);
      me.handle(e);
      return false;
    }
  }

  #onMouseOver() {
    this.iconEl?.hover(true);
  }

  #onMouseOut() {
    this.iconEl?.hover(false);
  }

  get #title() {
    return this.translate(this.title);
  }

  get #first() { return this.rtl ? this.#title : this.#iconHtml; };

  get #second() { return this.rtl ? this.#iconHtml : this.#title; };

  get #iconHtml() { return this.icon ? this.#renderIcon : html`<slot name="icon"></slot>`; }

  get #renderIcon() {
    return  html`
    <gs-icon css="mx-1" ${ref(this.#refIco)} 
    name="${this.icon}" 
    size="${this.size}" 
    click-css="${ifDefined(this.clickCss)}" 
    hover-css="${ifDefined(this.hoverCss)}" 
    data-delay="1"></gs-icon>`;
  }

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
