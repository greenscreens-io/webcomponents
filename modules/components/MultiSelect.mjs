/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { css, html, ref, createRef } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSEvents } from '../base/GSEvents.mjs';

/**
 * Composite UI component for dropdown multiselect
 */
export class GSMultiSelect extends GSElement {

  static style = css`
      .multi-select-menu {
            width: 100%;
            max-height: 350px;
            overflow-y: auto;
        }

        .multi-select-options {
            max-height: 200px;
            overflow-y: auto;
        }

        .multi-select-options .form-check {
            padding: 6px 10px 6px 35px;
            border-radius: 4px;
        }

        .multi-select-options .form-check:hover {
            background-color: #f1f3f5;
        }

        .multi-select-button {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }  
  `;

  static properties = {
    required: { reflect: true, type: Boolean },
    name: { type: String },
    value: { type: String },
    data: { attribute: false, type: Array }
  }

  #inputRef = createRef();
  #boxRef = createRef();
  #btnRef = createRef();
  #optsRef = createRef();
  #countRef = createRef();

  #data = [];

  constructor() {
    super();
    this.value = '';
    this.name = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.attachEvent(document, 'click', this.#handleOutsideClick);
    this.attachEvent(document, 'keydown', this.#handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEvent(document, 'click', this.#handleOutsideClick);
    this.removeEvent(document, 'keydown', this.#handleKeydown);
  }

  firstUpdated() {
    super.firstUpdated?.();
    this.#syncSelection();
  }

  renderUI() {
    const me = this;
    return html`
          <input ${ref(me.#inputRef)} is="gs-ext-input" type="hidden" .name=${me.name} ?required=${me.required}>
          <div class="dropdown">
                  <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start multi-select-button"
                          ${ref(me.#btnRef)}
                          @click=${(e) => me.#toggle(e)} 
                          type="button"
                          data-bs-toggle="dropdown"
                          data-bs-auto-close="outside"
                          aria-expanded="false">
                      Select options
                  </button>
                  <div class="dropdown-menu multi-select-menu p-3" ${ref(me.#boxRef)}>
                
                      <!-- Search -->
                      <input type="text" @input=${(e) => me.#search(e)} 
                            class="form-control mb-2"
                            placeholder="Search options...">

                      <!-- Select all / Clear all -->
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <a @click=${(e) => me.#selectAll(e)} href="#">Select All</a>
                          <a @click=${(e) => me.#clearAll(e)}  href="#">Clear All</a>
                      </div>

                      <hr class="my-2">

                      <!-- Options -->
                      <div ${ref(me.#optsRef)} class="multi-select-options">
                        ${me.#renderOptions()}
                      </div>

                      <hr class="my-2">

                      <small ${ref(me.#countRef)} class="text-muted">
                          0 selected
                      </small>

                  </div>
              </div>    
    `;
  }

  #renderOptions() {
    return GSItem.collect(this).map((el, i) =>
      this.#renderOption(i, el.name));
  }

  #renderOption(idx = 0, value = '') {
    return html`<div class="form-check" data-index=${idx}>
      <input class="form-check-input option" type="checkbox" value="${value}" id="opt${idx}" @change=${(e) => this.#updateSelection(e)}>
      <label class="form-check-label" for="opt${idx}">${value}</label>
      </div>`;
  }

  get #options() {
    return GSDOM.queryAll(this.#optsRef.value, ".option");
  }

  get #visibleOptions() {
    return [...this.#options].filter(option => {
      return option.closest('.form-check').style.display !== 'none';
    });
  }

  #toggle(e) {
    GSDOM.toggleClass(this.#boxRef.value, 'show');
  }

  #close() {
    GSDOM.toggleClass(this.#boxRef.value, 'show', false);
  }

  #handleOutsideClick = (e) => {
    if (!e.composedPath().includes(this)) {
      this.#close();
    }
  };

  #handleKeydown = (e) => {
    if (e.key === 'Escape') {
      this.#close();
    }
  };

  #updateSelection(e) {
    const me = this;
    me.#data = me.#options
      .filter(option => option.checked)
      .map(option => option.value);

    me.#btnRef.value.textContent =
      me.#data.length
        ? me.#data.join(', ')
        : 'Select options';

    me.#countRef.value.textContent =
      `${me.#data.length} selected`;

    me.#inputRef.value.value = me.value;
  }

  #updateSelectors(value) {
    const me = this;
    me.#visibleOptions.forEach(option => {
      option.checked = value;
    });
    me.#updateSelection();
  }

  #selectAll(e) {
    GSEvents.prevent(e);
    this.#updateSelectors(true);
    this.#close();
  }

  #clearAll(e) {
    GSEvents.prevent(e);
    this.#updateSelectors(false);
    this.#close();
  }

  #search(e) {
    const filter = e.target.value.toLowerCase();

    this.#options.forEach(option => {
      const item = option.closest('.form-check');
      const text = option.value.toLowerCase();
      item.style.display = text.includes(filter)
        ? ''
        : 'none';
    });
  }

  #syncSelection() {
    const me = this;
    if (!me.#optsRef.value) return;

    const selected = new Set(me.#data);

    me.#options.forEach(option => {
      option.checked = selected.has(option.value);
    });

    me.#updateSelection();
  }

  get field() {
    return this.#inputRef.value;
  }


  get data() {
    return [...this.#data];
  }

  set data(value) {
    const me = this;
    const oldValue = me.#data;

    me.#data = Array.isArray(value)
      ? [...new Set(value)]
      : [];

    me.requestUpdate('data', oldValue);
    me.#syncSelection();
  }

  get value() {
    return this.#data.join(',');
  }

  set value(value) {
    this.data = typeof value === 'string'
      ? value.split(',').map(v => v.trim()).filter(Boolean)
      : [];
  }

  static {
    this.define('gs-multi-select');
  }

}