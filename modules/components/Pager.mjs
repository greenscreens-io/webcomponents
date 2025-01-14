/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { classMap, createRef, html, ifDefined, map, range, ref } from '../lib.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSElement } from '../GSElement.mjs';
import { size, SizeTypes } from '../properties/index.mjs';

export class GSPagerElement extends GSElement {

  static properties = {
    storage: {},
    size: { ...size },
    first: { type: Boolean },
    last: { type: Boolean },
    next: { type: Boolean },
    previous: { type: Boolean },
    pages: { type: Number },

    labelFirst: { attribute: 'label-first' },
    labelLast: { attribute: 'label-last' },
    labelNext: { attribute: 'label-next' },
    labelPrevious: { attribute: 'label-previous' },

    cssItem: { attribute: 'css-item' },

  }

  #ref = createRef();

  constructor() {
    super();
    this.pages = 5;
    this.labelFirst = '&laquo;';
    this.labelLast = '&raquo;';
    this.labelNext = '&rsaquo;';
    this.labelPrevious = '&lsaquo;';
  }

  renderUI() {
    const me = this;
    const half = Math.floor((me.pages - 1) / 2);
    const page = me.dataController?.page || 0;
    const start = page - half < 1 ? 1 : page - half;
    const end = page > 0 ? page + half : me.pages;

    return html`<nav 
        dir="${ifDefined(me.direction)}"
        @click="${me.#onClick}"
        @keyup="${me.#onKeyUp}"
        @keydown="${me.#onKeyDown}">
        <ul ${ref(me.#ref)} class="${classMap(me.renderClass())}">
        ${me.#renderFirst()}
        ${me.#renderPrevious()}
        ${map(range(start, end + 1), (i) => me.#renderItem(i, '', '', i  === page))}
        ${me.#renderNext()}
        ${me.#renderLast()}
        </ul></nav>`;
  }

  renderClass() {
    const me = this;
    const size = me.size ? SizeTypes[me.size] || me.size : '';
    const css = {
      ...super.renderClass(),
      'pagination': true,
      [`pagination-${size}`]: size,

    }
    return css;
  }

  updated() {
    const target = this.#ref.value;
    if (target && this.isFocused) {
      target.querySelector('.active > a')?.focus();
    }
  }

  onDataRead() {
    this.requestUpdate();
  }

  #renderFirst() {
    return this.first ? this.#renderItem(this.labelFirst, 'first', 'First page') : '';
  }

  #renderLast() {
    return this.last ? this.#renderItem(this.labelLast, 'last', 'Last page') : '';
  }

  #renderPrevious() {
    return this.previous ? this.#renderItem(this.labelPrevious, 'previous', 'Previous page') : '';
  }

  #renderNext() {
    return this.next ? this.#renderItem(this.labelNext, 'next', 'Next page') : '';
  }

  #renderItem(text = '', name = '', title = '', active = false) {
    const me = this;
    text = GSUtil.decodeHTMLEntities(text);
    return html`<li class="page-item ${active ? 'active' : ''}">
              <a class="page-link ${this.cssItem}" 
                 name="${name}" 
                 title="${me.translate(title)}" 
                 href="#">${me.translate(text)}</a>
            </li>`;
  }

  #onClick(e) {

    const me = this;
    const el = this.#toTarget(e, 'a');
    if (!el) return;

    const ctrl = me.dataController;
    if (!ctrl) return;

    const val = el.name || el.text;
    me.emit(val, el);
    
    switch (val) {
      case 'first':
        return ctrl.firstPage();
      case 'last':
        return ctrl.lastPage();
      case 'next':
        return ctrl.nextPage();
      case 'previous':
        return ctrl.prevPage();
    }

    ctrl.page = val;
  }

  #onKeyDown(e) {
    const current = this.#toTarget(e, 'li');
    let el = null;
    switch (e.code) {
      case 'ArrowLeft':
        el = current?.previousElementSibling;
        break;
      case 'ArrowRight':
        el = current?.nextElementSibling;
        break;
    }
    el = el?.querySelector('a');
    el?.focus();
  }

  #onKeyUp(e) {
    if (e.code === 'Space') {
      this.#toTarget(e, 'a')?.click();
    }
  }

  #toTarget(e, name) {
    const el = e.target.closest(name) || e.target;
    return el.tagName === name.toUpperCase() ? el : undefined;
  }

  static {
    this.define('gs-pagination');
  }

}