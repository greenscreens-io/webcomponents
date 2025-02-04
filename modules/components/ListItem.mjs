/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, ifDefined, html, createRef, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

export class GSListItemElement extends GSElement {

  static properties = {
    url: {},
    target: {},
    title: {},
    icon: {},
    size: { type: Number },
    autofocus: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true }
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
    return this.parentComponent?.tagName === 'GS-LIST';
  }

  firstUpdated(changed) {
        // allow single setting at the gs-list to apply to the child
        // GSAttributeHandler.clone(this.parentComponent, this, false);
  }

  renderUI() {
    const me = this;
    return html`<a  tabindex="0" ${ref(me.#refEl)}
       href="${ifDefined(me.href)}" 
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
    return !GSUtil.asBool(this.disabled) || GSUtil.asBool(this.parentComponent.selectable);
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

  get href() {
    return this.url ? this.url : '#';
  }

  get #activeCSS() {
    return this.parentComponent.dataset?.cssActive || '';
  }

  get #inactiveCSS() {
    return this.parentComponent.dataset?.cssInactive || '';
  }

  get #itemCSS() {
    return this.parentComponent.dataset?.cssItem || '';
  }

  get #itemStatusCSS() {
    return this.active && this.isSelectable() ? this.#activeCSS : this.#inactiveCSS;
  }

  static {
    this.define('gs-list-item');
  }

}