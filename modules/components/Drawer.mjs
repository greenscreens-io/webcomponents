/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, unsafeHTML, html, ifDefined } from '../lib.mjs';
import { placement, PlacementTypes } from '../properties/placement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSElement } from '../GSElement.mjs';

export class GSDrawerElement extends GSElement {

  static properties = {
    autoclose: { reflect: true, type: Boolean },
    closable: { reflect: true, type: Boolean },
    backdrop: { reflect: true, type: Boolean },
    expanded: { reflect: true, type: Boolean },
    scroll: { reflect: true, type: Boolean },

    min: { reflect: true, type: Number},
    max: { reflect: true},
    fingers: { reflect: true, type: Number},
    placement: {...placement},
    
    transition: { reflect: true },
    duration: { reflect: true, type: Number },

    title: { reflect: true},

    cssTitle: { reflect: true, attribute: "css-title"},
    cssHead: { reflect: true, attribute: "css-head" },
    cssBody: { reflect: true, attribute: "css-body" },
  }

  constructor() {
    super();
    const me = this;
    me.placement = 'start';
    me.cssTitle = 'fs-5';
    me.transition = 'linear';
    me.duration = 0.2;
    me.min = 0;
    me.max = 'auto';
    me.fingers = 2;
    me.on('mouseleave', me.#onLeave.bind(me));
    me.on('mouseenter', me.#onEnter.bind(me));
  }

  renderUI() {
    const me = this;
    return html`${unsafeHTML(me.#style)}
    <div tabindex="-1" dir="${ifDefined(me.direction)}"
     class="offcanvas overflow-hidden anime ${classMap(me.renderClass())}">
      ${me.#header}
      <div class="offcanvas-body  ${me.cssBody}">
        ${me.renderTemplate()}
        <slot name="body"></slot>
      </div>
    </div>${me.#backdrop}`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'show': true,
      'anime-open' : me.expanded,
      'anime-close' : !me.expanded,
      [`offcanvas-${me.placement}`]: me.placement,
    }
    return css;
  }

  get #style() {
    const me = this;
    const pos = me.isHorizontal ? 'width' : 'height';
    return `<style>
    .anime {
      transition-property: ${pos} !important;
      transition-duration: ${me.duration}s  !important;
      transition-timing-function: ${me.transition} !important;
    }
    .anime-open {
        ${pos} : ${me.max}${GSUtil.isNumber(me.max) ? 'px':''} !important;
    }
    .anime-close {
      ${pos} : ${me.min}${GSUtil.isNumber(me.min) ? 'px':''} !important;
    }    
    </style>`;
  }

  get #backdrop() {
    const me = this;
    if (!me.backdrop) return '';
    return html`<div class="offcanvas-backdrop fade ${me.expanded ? 'show' : 'invisible'}" @click="${me.close}"></div>`;
  }

  get #button() {
    const me = this;
    return me.closable ? html`<button type="button" class="btn-close text-reset" @click="${me.close}"></button>` : '';
  }

  get #title() {
    const me = this;
    return me.title ? html`<div class="offcanvas-title ${me.cssTitle}">${me.translate(me.title)}</div>` : '';
  }

  get #header() {
    const me = this;
    return me.#hasHeader ? html`<div class="offcanvas-header ${me.cssHead}"><slot name="header">${me.#title}${me.#button}</slot></div>` : '';
  }

  get #headSlot() {
    return this.querySelector('[slot="header"]', false, true);
  }

  get #hasHeader() {
    return this.title || this.closable || this.#headSlot;
  }

  #notify(val) {
    const me = this;
    me.expanded = val == true;
    me.notify();
  }

  #onLeave() {
    const me = this;
    if (me.autoclose) me.close();
  }

  #onEnter() {
    const me = this;
    if (me.min > 0) me.open();
  }

  open() {
    this.#notify(true);
  }

  close() {
    this.#notify(false);
  }

  toggle() {
    this.#notify(!this.expanded);
  }

  get isHorizontal() {
    return !this.isVertical;
  }

  get isVertical() {
    return PlacementTypes.isVertical(this.placement);
  }

  static {
    this.define('gs-drawer');
  }

}