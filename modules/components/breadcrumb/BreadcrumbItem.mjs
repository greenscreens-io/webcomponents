/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, html, ifDefined } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';
import { color } from '../../properties/color.mjs';
import { GSLinklement } from '../Link.mjs';
import { GSAttributeHandler } from '../../base/GSAttributeHandler.mjs';

export class GSBreadcrumbItemElement extends GSElement {

  static properties = {
    href: {},
    color: { ...color },
    data: { state: true, type: Object },
    active: { reflect: true, type: Boolean },
    divider: { state: true, type: Boolean },
    spacing: { state: true, type: Number },
  }

  constructor() {
    super();
    this.data = {};
  }

  renderUI() {
    const me = this;
    return html`<div part="base" class="breadcrumb-item ${classMap(me.renderClass())}"  dir="${ifDefined(me.direction)}">
        <span part="prefix"><slot name="prefix"></slot></span>        
        ${me.#label}
        <span part="suffix"><slot name="suffix"></slot></span>
        <span part="separator"><slot name="separator">${me.#separator}</slot></span>
      </div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'active': me.active,
    }
    return css;
  }

  get #label() {
    const me = this;
    if (me.active) return html`<slot></slot>`;
    me.data.url = me.data.url || me.href;
    me.data.part = 'label';
    return GSLinklement.generate(me.data, {})
  }

  get #separator() {
    const me = this;
    return me.nextElementSibling && me.divider ? html`<gs-icon size="7" color="${me.color}" css="mx-${me.spacing}" name="${me.divider}"></gs-icon>` : '';
  }

  handle(e) {
    GSAttributeHandler.process(this.query('a', true), e);
  }

  static {
    this.define('gs-breadcrumb-item');
  }

}