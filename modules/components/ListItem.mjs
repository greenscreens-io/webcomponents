/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, ifDefined, html, createRef, ref } from '../lib.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSElement } from '../GSElement.mjs';

export class GSListItemElement extends GSElement {

  static properties = {
    href: {},
    target: {},
    title: {},
    icon: {},
    autofocus: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true },
    selectable: { type: Boolean, reflect: true },
    generated: { state: true, type: Boolean }
  }

  #initial;
  #refEl = createRef();

  constructor() {
    super();
    this.binded();
  }

  connectedCallback() {
    super.connectedCallback();
    this.#initial = this.active;
  }

  shouldUpdate(changedProperties) {
    return this.owner?.tagName === 'GS-LIST';
  }

  renderUI() {
    const me = this;
    let obj = me.mapCSS(me.#activeCSS, {});
    return html`<a  tabindex="0" ${ref(me.#refEl)}
       href="${ifDefined(me.url)}" 
       target="${ifDefined(me.target)}" 
       class="${classMap(me.renderClass())}">
        ${me.#renderFirst()} 
        ${me.#renderSecond()}
        <slot>${me.renderTemplate()}</slot>
      </a>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'list-group-item': true,
      'list-group-item-action': true,
      [me.#itemCSS] : true,
      'active': me.active
    }
    return me.active ? me.mapCSS(me.#activeCSS, css) : css;
  }

  #renderIcon() {
    return this.icon ? html`<gs-icon name="${this.icon}"></gs-icon>` : html`<slot name="icon"></slot>`;
  }

  #renderFirst() {
    return this.rtl ? this.translate(this.title) : this.#renderIcon();
  }

  #renderSecond() {
    return this.rtl ? this.#renderIcon() : this.translate(this.title);
  }

  toggle() {
    this.active = !this.active;
  }

  reset() {
    this.active = this.autofocus || this.#initial || false;
  }

  click() {
    this.#refEl.value?.click();
  }

  focus() {
    requestAnimationFrame(() => this.#refEl.value?.focus());
  }

  get url() {
    return this.href && this.target ? this.href : '#';
  }

  get owner() {
    return (this.hasAttribute('generated') ? GSDOM.component(this) : this.parentElement);
  }
  
  get #activeCSS() {
    return this.owner.dataset?.cssActive || '';
  }

  get #itemCSS() {
    return this.owner.dataset?.cssItem || '';
  }

  static {
    this.define('gs-list-item');
  }

}