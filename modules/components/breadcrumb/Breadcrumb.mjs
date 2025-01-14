/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { html, ifDefined, repeat } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';
import { color } from '../../properties/color.mjs';

export class GSBreadcrumbElement extends GSElement {

  static properties = {
    storage: {},
    data: { type: Array },
    color: { ...color },
    divider: { reflect: true },
    spacing: { reflect: true, type: Number },
  }

  constructor() {
    super();
    const me = this;
    me.spacing = 1;
    me.divider = 'chevron-right';
    me.#updateChildren();
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    this.#updateChildren();
  }

  renderUI() {
    const me = this;
    return html`<nav part="base" class="breadcrumb" @click="${me.#onClick}" dir="${ifDefined(me.direction)}"><slot>
      ${repeat(me.data || [], (item) => item, (item) => html`
        <gs-breadcrumb-item  
        href="${item.href}"
        color="${item.color}"
        .data=${item}     
        .active=${item.active}
        .divider="${item.divider || me.divider}"
        .spacing="${item.spacing || me.spacing}">
          ${item.$text}
        </gs-breadcrumb-item>
      `)}
    </slot></nav>`;
  }

  onDataRead(data) {
    this.data = data;
  }

  #updateChildren() {
    const me = this;
    me.queryAll('gs-breadcrumb-item').forEach(el => {
      el.divider = me.divider;
      el.spacing = me.spacing;
      el.color = me.color;
    });
  }

  #onClick(e) {
    const el = e.target.closest('gs-bradcrumb-item');
    el?.handle(e);
  } 

  static {
    this.define('gs-breadcrumb');
  }

}