/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { classMap, ifDefined, html, createRef, ref } from '../lib.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSAttributeHandler } from '../base/GSAttributeHandler.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

export class GSListItemElement extends GSElement {

  static properties = {
    href: {},
    target: {},
    title: {},
    icon: {},
    size: { type: Number },
    autofocus: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true },
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
    // allow single setting at the gs-list to applay to the child
    GSAttributeHandler.clone(this.owner, this, false);
  }

  shouldUpdate(changedProperties) {
    return this.owner?.tagName === 'GS-LIST';
  }

  renderUI() {
    const me = this;
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
      [`fs-${me.size}`]: me.size > 0,
      [me.#itemCSS] : true,
      'active': me.active && me.isSelectable()
    }
    return me.mapCSS(me.#itemStatusCSS, css);
  }

  isSelectable() {
    return !GSUtil.asBool(this.disabled) || GSUtil.asBool(this.owner.selectable);
  }

  #renderIcon() {
    const me = this;
    return me.icon ? html`<gs-icon name="${me.icon}" size="${me.size}"></gs-icon>` : html`<slot name="icon"></slot>`;
  }

  #renderText() {
    return this.title ? html`<span>${this.translate(this.title)}</span>` : html`<slot name="title"></slot>`;
  }

  #renderFirst() {
    return this.rtl ? this.#renderText() : this.#renderIcon();
  }

  #renderSecond() {
    return this.rtl ? this.#renderIcon() : this.#renderText();
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

  // TODO Can I use this.parentComponent ? 
  get owner() {
    return (this.hasAttribute('generated') ? GSDOM.component(this) : this.parentElement);
  }
  
  get #activeCSS() {
    return this.owner.dataset?.cssActive || '';
  }

  get #inactiveCSS() {
    return this.owner.dataset?.cssInactive || '';
  }

  get #itemCSS() {
    return this.owner.dataset?.cssItem || '';
  }

  get #itemStatusCSS() {
    return this.active && this.isSelectable() ? this.#activeCSS : this.#inactiveCSS;
  }

  static {
    this.define('gs-list-item');
  }

}