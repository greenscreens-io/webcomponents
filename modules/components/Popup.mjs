/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { createRef, ref, classMap, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { placement, position } from '../properties/index.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSPopper } from "../base/GSPopper.mjs";
import { GSID } from '../base/GSID.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

export class GSPopupElement extends GSElement {

  static properties = {
    placement: { ...placement },
    position: { ...position },
    trigger: {},
    target: {},
    autoclose: { type: Boolean },
    autofocus: { type: Boolean },
    opened: { type: Boolean },
    hPos: { type: Number, attribute: 'h-pos' },
    vPos: { type: Number, attribute: 'v-pos' },
    wMin: { type: Number, attribute: 'w-min' },
    wMax: { type: Number, attribute: 'w-max' },
    hMin: { type: Number, attribute: 'h-min' },
    hMax: { type: Number, attribute: 'h-max' },

  }

  #caller = null;
  #panelRef = createRef();
  #styleID = GSID.id;

  constructor() {
    super();
    this.autofocus = true;
    this.autoclose = true;
    this.trigger = 'click';
    this.position = 'absolute';
    this.placement = 'bottom';
    this.dynamicStyle(this.#styleID);
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;
    me.#attachTarget(); // Fixed typo: #attachTaraget -> #attachTarget
    me.attachEvent(window, 'resize', me.close.bind(me));
    me.on('mouseleave', me.#onAuto.bind(me));
  }

  firstUpdated(changedProperties) {
    const me = this;
    requestAnimationFrame(() => {
      me.#resize();
      me.#reposition();
    });
    super.firstUpdated();
  }

  updated() {
    const me = this;
    me.#reposition();
    if (me.autofocus) me.focus();
    me.notify();
    me.#postPopup();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('opened')) {
      this.#postPopup();
    }
    return super.willUpdate(changedProperties); 
  }

  renderUI() {
    const me = this;
    return html`<div 
      ${ref(me.#panelRef)}
      dir="${ifDefined(me.direction)}"
      class="fade ${classMap(me.renderClass())}"
      data-gs-class="${me.#styleID}"
      @keydown="${me.#onKeyDown}">
      ${me.renderTemplate()}
      <slot></slot>
    </div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'show': me.opened,
      //'d-none' : !me.opened,
      [me.#styleID]: true,
      [`position-${me.position}`]: me.position,
    }
    return css;
  }

  focus() {
    this.query('[tabindex], input, select, textarea, button, a', true)?.focus();
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

  /**
   * Show popup at x/y position on the screen
   * @param {Number} x 
   * @param {Number} y 
   * @returns {void}
   */
  popup(x = 0, y = 0) {
    const me = this;
    const obj = {
      top: '0px',
      left: '0px',
      translate: `${x}px ${y}px`
    };
    me.#resize(obj);
  }

  #onKeyDown(e) {
    const me = this;
    switch (e.key) {
      case 'Escape':
        me.close();
        break;
    }
  }

  #reposition() {
    const me = this;
    //if (!me.opened) return;
    if (me.vPos || me.hPos) {
      const opt = {
        top: '0px',
        left: '0px',
        translate: `${me.hPos}px ${me.vPos}px`
      };
      const rule = me.dynamicStyle(me.#styleID);
      Object.assign(rule.style, opt);
    } else if (me.target) {
      let target = GSDOM.query(document.documentElement, me.target);
      target = target.renderRoot?.firstElementChild || target;
      GSPopper.popupFixed(me.placement, me.#panel, target);
    }

  }

  #resize(obj = {}) {
    const me = this;
    const rule = me.dynamicStyle(me.#styleID);
    if (me.wMax) obj['max-width'] = `${me.wMax}px`;
    if (me.wMin) obj['min-width'] = `${me.wMin}px`;
    if (me.hMax) obj['max-height'] = `${me.hMax}px`;
    if (me.hMin) obj['min-height'] = `${me.hMin}px`;
    Object.assign(rule.style, obj);
  }

  #onPopup(e) {
    const me = this;
    me.#caller = e;
    if (e instanceof Event) {
      GSEvents.prevent(e);
      me.#caller = e.composedPath().filter(e => (!(e instanceof HTMLSlotElement))).shift();
    }

    if (me.placement) {
      GSPopper.popupFixed(me.placement, me.#panel, me.#caller);
      me.opened = true;
      return;
    }

    let x = e.clientX, y = e.clientY;
    const rect = me.#panel.getBoundingClientRect();
    const overflowH = x + rect.width > window.innerWidth;
    const overflowV = y + rect.height > window.innerHeight;

    if (overflowH) x = window.innerWidth - rect.width;
    if (overflowV) y = window.innerHeight - rect.height;

    me.popup(x, y);
    return true;
  }

  #postPopup() {
    const me = this;
    const rule = me.dynamicStyle(me.#styleID);
    Object.assign(rule.style, {display: me.opened ? '' : 'none'}); 
  }

  #attachTarget() { // Fixed typo: #attachTaraget -> #attachTarget
    const me = this;
    const targets = GSDOM.queryAll(document.documentElement, me.target);
    me.trigger.split(' ').forEach(evt => {
      targets.forEach(target => me.attachEvent(target, evt, me.#onPopup.bind(me)));
    });
  }

  #onAuto(e) {
    if (this.autoclose) this.close();
  }

  get #panel() {
    return this.#panelRef.value;
  }

  static {
    this.define('gs-popup');
  }

}