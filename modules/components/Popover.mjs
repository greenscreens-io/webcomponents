/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { createRef, ref, classMap, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { placement } from '../properties/index.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSPopper } from '../base/GSPopper.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

export class GSPopoverElement extends GSElement { // Fixed typo: GSPopoverlement -> GSPopoverElement

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
  #bindings = [];
  #openOnHover = () => this.open();
  #closeOnLeave = () => this.close();
  #onTargetFocus = () => this.open();
  #onTargetBlur = (e) => this.#closeOnFocusLeave(e);
  #onPanelBlur = (e) => this.#closeOnFocusLeave(e);
  #onWindowClick = (e) => {
    if (!e.composedPath().includes(this.#ref) && !e.composedPath().includes(this.#panel)) {
      this.close();
    }
  };
  #toggleOnClick = (e) => {
    GSEvents.prevent(e);
    this.toggle();
  };

  constructor() {
    super();
    const me = this;
    // added to the GSCacheStyle
    //me.style.position = 'fixed';
    me.placement = 'top';
    me.trigger = 'hover';
    me.content = '';
    me.dynamicStyle(me.#styleID);
    me.dynamicStyle(me.#arrowID);
  }

  firstUpdated(changed) {
    const me = this;
    super.firstUpdated(changed);
  }

  disconnectedCallback() {
    this.#bindings = [];
    super.disconnectedCallback();
  }
  
  willUpdate(changed) {
    super.willUpdate(changed);
  }

  updated(changed) {
    if (!this.#bindings.length || changed.has('target') || changed.has('trigger')) this.#attachEvents();
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
    return this.#triggers.includes('focus');
  }

  get isHoverTrigger() {
    return this.#triggers.includes('hover');
  }

  get #triggers() {
    return typeof this.trigger === 'string' ? this.trigger.split(/\s+/).filter(Boolean) : [];
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
    me.#bindings.forEach(({ target, name, handler }) => me.removeEvent(target, name, handler));
    me.#bindings = [];
    const add = (target, name, handler) => {
      if (target && me.attachEvent(target, name, handler)) {
        me.#bindings.push({ target, name, handler });
      }
    };

    if (me.isHoverTrigger) {
      add(el, 'mouseover', me.#openOnHover);
      add(el, 'mouseleave', me.#closeOnLeave);
    }

    if (me.isFocusTrigger) {
      add(el, 'focusin', me.#onTargetFocus);
      add(el, 'focusout', me.#onTargetBlur);
      add(me.#panel, 'focusout', me.#onPanelBlur);
    }
    if (me.#triggers.includes('click')) {
      add(el, 'click', me.#toggleOnClick);
      add(window, 'click', me.#onWindowClick);
    }

  }

  #closeOnFocusLeave(e) {
    const next = e.relatedTarget;
    if (!next || (!this.#ref?.contains(next) && !this.#panel?.contains(next))) this.close();
  }
  
  get #arrow() { return this.#arrowRef.value; }
  get #panel() { return this.#panelRef.value; }

  static {
    this.define('gs-popover');
  }

}