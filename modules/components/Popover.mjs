/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { createRef, ref, classMap, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { placement } from '../properties/index.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSPopper } from '../base/GSPopper.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

export class GSPopoverlement extends GSElement {

  static properties = {
    placement: { ...placement },
    target: {},
    trigger: {},
    title: {},
    content: {},
    opened: { type: Boolean },
  }

  #arrowRef = createRef();
  #panelRef = createRef();
  #styleID = GSID.id;
  #arrowID = GSID.id;

  constructor() {
    super();
    // added to the GSCacheStyle
    //this.style.position = 'fixed';
    this.placement = 'top';
    this.trigger = 'hover';
    this.content = '';
    this.dynamicStyle(this.#styleID);
    this.dynamicStyle(this.#arrowID);
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
    const head = me.title ? html`<div class="popover-header ${me.cssHead}">${me.translate(me.title)}</div>` : '';
    return html`
    <div ${ref(me.#panelRef)} 
        dir="${ifDefined(me.direction)}"
        data-popper-placement="${me.placement}"
        class="${classMap(me.renderClass())}" 
        data-gs-class="${me.#styleID}" 
        role="tooltip">
        <div ${ref(me.#arrowRef)} 
          class="popover-arrow ${me.#arrowID}" 
          data-gs-class="${me.#arrowID}">
        </div>
        ${head}
        <div class="popover-body">
          ${me.renderTemplate()}
          ${me.content}
          <slot></slot>
        </div>
    </div>            
    `;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'popover': true,
      'bs-popover-auto': true,
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

  get isFocusTrigger() {
    return this.trigger.includes('focus');
  }

  get isHoverTrigger() {
    return this.trigger.includes('hover');
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
        return GSDOM.query(document.body, me.target);
    }
  }

  #reposition() {
    const me = this;
    const source = me.#panel;
    if (!source) return;
    if (me.opened) {
      GSPopper.popupAbsolute(me.placement, source, me.#ref, me.#arrow);
    } else {
      me.dynamicStyle(me.#styleID, {top:'-1000px', left:'-1000px'});
    }
  }

  // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
  #attachEvents() {

    const me = this;
    const el = me.#ref;

    if (me.isHoverTrigger) {
      GSEvents.attach(me, el, 'mouseover', me.open.bind(me));
      GSEvents.attach(me, el, 'mouseleave', me.close.bind(me));
    }

    if (me.isFocusTrigger) {
      GSEvents.attach(me, el, 'click', me.#onFocus.bind(me));
      GSEvents.attach(me, me.#panel, 'mouseleave', me.close.bind(me));
      GSEvents.attach(me, window, 'click', me.close.bind(me));
    }

  }

  #onFocus(e) {
    GSEvents.prevent(e);
    this.toggle();
  }
  
  get #arrow() { return this.#arrowRef.value; }
  get #panel() { return this.#panelRef.value; }

  static {
    this.define('gs-popover');
  }

}