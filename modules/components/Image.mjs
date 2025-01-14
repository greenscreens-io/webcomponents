/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { createRef, html, ifDefined, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { notEmpty, numGE0 } from '../properties/index.mjs';
import { GSID } from '../base/GSID.mjs';

const numdef = { reflect: true, type: Number, hasChanged: numGE0 };

export class GSImageElement extends GSElement {

  static properties = {
    src: { hasChanged: notEmpty },
    width: numdef,
    height: numdef,
    opacity: numdef,
    invert: numdef,
    grayscale: numdef,
    brightness: numdef,
    blur: numdef,
    contrast: numdef,
    saturate: numdef,
    hue: numdef,
    sepia: numdef,

    alt: {},
    loading: {}

  }

  #imageRef = createRef();
  #styleID = GSID.id;

  constructor() {
    super();
    this.dynamicStyle(this.#styleID);
  }

  shouldUpdate(changed) {
    this.#update();
    return this.src;
  }

  renderUI() {
    const me = this;
    return html`<img ${ref(me.#imageRef)} 
            @load="${me.#onLoad}"
            src="${me.src}" 
            alt="${me.alt}" 
            loading="${ifDefined(me.loading)}" 
            class="${me.#styleID}" 
            data-gs-class="${me.#styleID}">
          </img>`;
  }

  get complete() {
    return this.#imageRef.value?.complete || false;
  }

  get #dynamic() {
    return this.dynamicStyle(this.#styleID).style;
  }

  #renderStyle() {
    const me = this;
    const filter = me.#buildFilter();
    const css = {
      width: me.width > 0 ? me.width : undefined,
      height: me.height > 0 ? me.height : undefined,
      filter: filter.length > 0 ? filter.join(' ') : ''
    }
    return css;
  }

  #buildFilter() {
    const me = this;
    const o = [];

    if (me.blur > 0) o.push(`blur(${me.blur}px)`);
    if (me.invert > 0) o.push(`invert(${me.invert})`);
    if (me.opacity > 0) o.push(`opacity(${me.opacity})`);
    if (me.contrast > 0) o.push(`contrast(${me.contrast})`);
    if (me.grayscale > 0) o.push(`grayscale(${me.grayscale})`);
    if (me.brightness > 0) o.push(`brightness(${me.brightness})`);

    if (me.hue > 0) o.push(`hue-rotate(${me.hue}deg)`);
    if (me.sepia > 0) o.push(`sepia(${me.sepia}%)`);
    if (me.saturate > 0) o.push(`saturate(${me.saturate}%)`);

    return o;
  }

  #update() {
    const me = this;
    const dynamic = me.#dynamic;
    dynamic.filter = me.#buildFilter().join(' ').trim();
    dynamic.width = me.width > 0 ? `${me.width}px` : '';
    dynamic.height = me.height > 0 ? `${me.height}px` : '';
  }

  #onLoad(e) {
    const el = e.target;
    const me = this;
    if (el) {
      me.height = me.height || el.height;
      me.width = me.width || el.width;
      me.emit('loaded', { width: el.width, height: el.height, element: el }, true);
    }
  }

  static {
    this.define('gs-image');
  }

}