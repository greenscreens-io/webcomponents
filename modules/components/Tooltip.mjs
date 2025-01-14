/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { createRef, ref, classMap, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { placement } from '../properties/index.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSPopper } from '../base/GSPopper.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

export class GSTooltipElement extends GSElement {

  static properties = {
    placement: { ...placement },
    title: {},
    target: {},
    opened: { type: Boolean },
    local: { type: Boolean },
  }

  #arrowRef = createRef();
  #panelRef = createRef();
  #styleID = GSID.id;
  #arrowStyle = GSID.id;

  constructor() {
    super();
    this.placement = 'top';
    this.dynamicStyle(this.#styleID);
    this.dynamicStyle(this.#arrowStyle);
  }

  firstUpdated(changed) {
    super.connectedCallback();
    const me = this;
    me.#attachEvents();
    me.#reposition();
    super.firstUpdated(changed);
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    this.#reposition();
  }

  renderUI() {
    const me = this;
    return html`
    <div ${ref(me.#panelRef)} 
      dir="${ifDefined(me.direction)}"
      role="tooltip"
      data-popper-placement="${me.placement}"
      data-gs-class="${me.#styleID}"
      class="${classMap(me.renderClass())}">
      <div ${ref(me.#arrowRef)} 
          class="tooltip-arrow ${me.#arrowStyle}" 
          data-gs-class="${me.#arrowStyle}">
      </div>
      <div class="tooltip-inner">${me.translate(me.title)}</div>
    </div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'tooltip': true,
      'bs-tooltip-auto': true,
      'fade': true,
      'show': me.opened,
      [me.#styleID]: true
    }
    return css;
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  toggle() {
    this.opened = !this.opened;
  }

  #attachEvents() {
    const me = this;
    me.attachEvent(me.#ref, 'mouseenter', me.open.bind(me));
    me.attachEvent(me.#ref, 'mouseleave', me.close.bind(me));
  }

  #reposition() {
    const me = this;
    const arrowEl = me.#arrow;
    const panelEl = me.#panel;
    if (!panelEl) return;
    if (me.opened) {
      GSPopper.popupFixed(me.placement, panelEl, me.#ref, arrowEl);
    } else {
      me.dynamicStyle(me.#styleID, { top: '-1000px', left: '-1000px' });
    }
  }

  get #ref() {
    const me = this;
    switch (me.target) {
      case '@parent':
        return this.parentElement;
      case '@previous':
        return this.previousElementSibling;
      case '@next':
        return this.nextElementSibling;
      default:
        return me.local ? me.#refLocal : me.#refGlobal;
    }
  }

  get #refLocal() {
    const root = GSDOM.root(this);
    return GSDOM.query(root, this.target);
  }
  
  get #refGlobal() {
    return GSDOM.query(document.body, this.target);
  }

  get #arrow() { return this.#arrowRef.value; }
  get #panel() { return this.#panelRef.value; }

  static {
    this.define('gs-tooltip');
  }

}