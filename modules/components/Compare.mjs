/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, createRef, css, html, ifDefined, ref } from '../lib.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSElement } from '../GSElement.mjs';
import { color, notEmpty } from '../properties/index.mjs';
import { ElementMoveController } from '../controllers/ElementMoveController.mjs';

export class GSCompareElement extends GSElement {

  static styles = css`.slider {
         --gs-position : 50%;
          left : var(--gs-position);
          width: 8px;
          height: 100%;
          border-width: 1px;
          cursor: w-resize;
          border-color: darkgray;
          border-style: solid;
          background-color: lightgray;
      }
      .clipper {
        --gs-position : 50%;
        clip-path: inset(0px var(--gs-position) 0px 0px);
      }
    `;

  static properties = {
    background: { ...color },
    width: { type: Number },
    height: { type: Number },
    before: { hasChanged: notEmpty },
    after: { hasChanged: notEmpty },
  }

  #styleID = GSID.id;

  #elRef = createRef();
  #clipRef = createRef();
  #slideRef = createRef();

  #mouseController;
  #elPosition;

  constructor() {
    super();
    const me = this;
    me.width = 0;
    me.height = 0;
    me.dynamicStyle(me.#styleID);
    me.#mouseController = new ElementMoveController(me);
  }

  firstUpdated(changed) {
    this.#mouseController.attach(this.#splitter);
    super.firstUpdated(changed);
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const me = this;
    const dynamic = me.#dynamic;
    dynamic.width = me.width > 0 ? `${me.width}px` : '';
    dynamic.height = me.height > 0 ? `${me.height}px` : '';
  }

  renderUI() {
    const me = this;
    return html`<div ${ref(me.#elRef)} 
         dir="${ifDefined(me.direction)}"
         @loaded="${me.#onLoad}" 
         @dblclick="${me.#onDoubleClick}"
         data-gs-class="${me.#styleID}"
         class="${classMap(me.renderClass())}">
      <div class="overflow-hidden position-absolute top-0 start-0 overflow-hidden"><slot name="before">${me.#before}</slot></div>
      <div ${ref(me.#clipRef)} class="overflow-hidden position-absolute top-0 start-0 overflow-hidden clipper"><slot name="after">${me.#after}</slot></div>
      <div ${ref(me.#slideRef)} class="slider position-absolute top-0><slot name="control"></slot></div>
    </div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      "position-relative": true,
      "user-select-none": true,
      "d-contents": me.isAuto,
      "h-100": me.isAuto,
      "w-100": me.isAuto,
      "overflow-hidden": true,
      [`bg-${me.background}`]: me.background,
      [`${me.#styleID}`]: true
    }
    return css;
  }

  /**
   * Handles resizing based on mouse move event
   * @param {MouseEvent} e 
   */
  onStartMove(e) {
    this.#elPosition = this.#splitter.getBoundingClientRect();
  }

  onMouseMove(e) {
    const me = this;
    const offset = me.#elPosition.left;
    const width = me.#elPosition.width;
    const pos = GSUtil.range(e.clientX - offset, 0, width);
    const pct = (pos / width) * 100;
    me.#update(pct);
  }

  get isAuto() {
    return this.width == 0 || this.height == 0;
  }

  get isFixed() {
    return !this.isAuto;
  }

  get #dynamic() {
    return this.dynamicStyle(this.#styleID).style;
  }

  get #before() {
    return this.before ? html`<img @load="${this.#onLoad}" src="${me.before}"></img>` : '';
  }

  get #after() {
    return this.after ? html`<img @load="${this.#onLoad}" src="${me.after}"></img>` : '';
  }

  get #isAuto() {
    return this.width === 0 || this.height === 0;
  }

  get #splitter() {
    return this.#elRef.value;
  }

  get #slider() {
    return this.#slideRef.value;
  }

  get #clip() {
    return this.#clipRef.value;
  }

  #onLoad(e) {
    const me = this;
    if (me.#isAuto) {
      const el = e.target;
      me.height = me.height || el.height;
      me.width = me.width || el.width;
    }
  }

  #onDoubleClick(e) {
    const me = this;
    me.prevent(e);
    me.#update();
    me.#mouseController.reset();
  }

  #update(pct = 50) {
    const me = this;
    me.#clip.style.setProperty('--gs-position', `${100 - pct}%`);
    me.#slider.style.setProperty('--gs-position', `${pct}%`);
  }

  static {
    this.define('gs-compare');
  }

}