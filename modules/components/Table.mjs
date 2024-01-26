/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, css, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { color } from '../properties/color.mjs';
import { GSData } from '../base/GSData.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

/**
 * A simple HTML Table rederer for read-only tabular data representation
 * For complex interactive dat use gs-table
 */
export class GSTableElement extends GSElement {

  static #icons = ['sort-up', 'arrow-down-up', 'sort-down-alt'];

  static styles = css`th:hover { opacity: 50% !important; }`;

  static CELLS = {
    align: {},
    width: {},
    filter: { type: Boolean },
    ...GSData.PROPERTIES
  }

  static properties = {
    storage: {},
    color: { ...color },
    colorHead: { ...color, attribute: 'head-color' },
    colorSelect: { ...color, attribute: 'select-color' },
    stripedColumn: { type: Boolean, attribute: 'striped-column' },
    divider: { type: Boolean },
    striped: { type: Boolean },
    hover: { type: Boolean },
    small: { type: Boolean },
    grid: { type: Boolean },
    borderless: { type: Boolean },

    filter: { type: Array, state: true },
    sort: { type: Array, state: true },
    columns: { type: Array, state: true },
    selections: { type: Array, state: true },
    key: { type: Number, state: true },

    data: { type: Array },
    datacolumn: { type: Boolean },
    multisort: { type: Boolean },
    multiselect: { type: Boolean },
    protected: { type: Boolean },
    selectable: { type: Boolean },
    sortable: { type: Boolean },
  }

  #config = [];
  #sortOrder = [];

  constructor() {
    super();
    this.headColor = 'secondary';
    this.colorSelect = 'info';
    this.columns = [];
    this.selections = [];
    this.data = [];
    this.filter = [];
    this.sort = [];
    this.key = 0;
  }

  get selected() {
    const me = this;
    return me.data.filter((v, i) => me.selectable.includes(i));
  }

  set search(val) {
    const me = this;
    if (me.storage) {
      return me.dataController.search = val;
    }
  }

  connectedCallback() {
    const me = this;
    me.#config = GSItem.proxify(me, GSTableElement.CELLS);
    if (me.columns.length === 0) me.columns = me.#config.map(v => v.name);
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.data = [];
    this.selections = [];
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'user-select-none': me.protected,
      'table': true,
      'table-sm': me.small,
      'table-hover': me.hover,
      'table-striped': me.striped,
      'table-bordered': me.grid,
      'table-borderless': me.borderless,
      'table-striped-columns': me.stripedColumns,
      [`table-${me.color}`]: me.color,
    }
    return css;
  }

  willUpdate(changed) {
    const me = this;
    if (me.columns.length != me.sort.length) me.sort = Array(me.columns.length).fill(0);
    if (me.datacolumn && me.data.length > 0) {
      me.columns = me.data[0];
      me.data = me.data.slice(1);
    }
    if (changed.has('multiselect') && !me.multiselect) me.selections = [];
    if (changed.has('selectable') && !me.selectable) me.selections = [];
    if (changed.has('sortable') || changed.has('multisort')) {
      me.sort = Array(me.columns.length).fill(0);
      me.#sortOrder = [];
    }
    super.willUpdate(changed);
  }

  renderUI() {
    const me = this;
    const headColor = me.colorHead ? `table-${me.colorHead}` : '';
    return html`
      <table  
       dir="${ifDefined(me.direction)}"
       @keyup="${me.#onKeyUp}"
       @keydown="${me.#onKeyDown}"
       class="${classMap(me.renderClass())}">
        <thead class="${ifDefined(headColor)}">
          ${me.#renderFilters()}
          <tr @click=${me.#onSort}>
            ${me.columns.map((entry, index) => me.#renderColumn(entry, index))}
          </tr>
        </thead>
        <tbody @click=${me.#onSelect} class="${me.divider ? 'table-group-divider' : ''}">
          ${me.data.map((entry, index) => me.#renderRecord(entry, index))}
        </tbody>
      </table>
      <slot name="extra"></slot>
    `;
  }

  onDataRead(data) {
    this.data = data;
    this.selections = [];
  }

  #renderFilters() {
    const me = this;
    const hasFilters = me.#config.filter(o => o.filter).length > 0;
    if (!hasFilters) return '';
    return html`<tr>${me.columns.map((entry, index) => me.#renderFilter(entry, index))}</tr>`
  }

  #renderFilter(cell, index) {
    const me = this;
    const cfg = me.#config[index];
    if (!cfg?.filter) return html`<th></th>`;
    const type = { 'string' : 'text', 'currency': 'number', 'timestamp' : 'datetime-local' }[cfg.type] || cfg.type;
    return html`<th><input is="gs-ext-input" class="form-control" name="${cell}" type="${type}"></th>`;
  }

  #renderColumn(cell, index) {
    const me = this;
    return html`
      <th .index=${index} width="${ifDefined(me.#config[index]?.width)}">
        <div class="d-flex justify-content-between"> 
          <span>${cell}</span>
          ${me.#renderIcon(index)}
        </div>
      </th>
    `
  }

  #renderIcon(index) {
    const me = this;
    if (!me.sortable) return '';
    const icons = GSTableElement.#icons;
    const sortType = me.sort[index];
    const order = me.multisort ? me.#sortOrder.indexOf(index) + 1 : '';
    return html`<gs-icon name="${icons[sortType + 1]}" super="${order > 0 ? order : ''}"></gs-icon>`;
  }

  #renderRecord(entry, index) {
    const me = this;
    if (!Array.isArray(entry)) entry = me.columns.map(v => entry[v]);
    entry = entry.map((val, i) => me.#config[i] ? GSData.format(me.#config[i], val) : val);
    const color = me.colorSelect && me.selections.includes(index) ? `table-${me.colorSelect}` : '';
    return html`
        <tr .index=${index} class="${color}" tabindex="0">
          ${entry.map((cell, i) => html`<td class="text-${me.#config[i]?.align}"><span>${cell}</span></td>`)}
        </tr>
      `;
  }

  #onSort(e) {
    const me = this;
    if (!me.sortable) return;
    const icon = e.target.tagName === 'GS-ICON' ? e.target : e.target.closest('gs-icon');
    const column = e.target.closest('th');
    if (!icon || !column) return;
    const idx = column.index !== undefined ? column.index : GSDOM.getElementIndex(column);
    const current = me.sort[idx];
    const sortType = current === 1 ? -1 : current + 1;

    if (me.multisort) {
      if (sortType == 0) {
        me.#sortOrder = me.#sortOrder.filter(v => v != idx);
      } else if (!me.#sortOrder.includes(idx)) {
        me.#sortOrder.push(idx);
      }
    } else {
      me.sort = Array(me.columns.length).fill(0);
      me.#sortOrder = [idx];
    }

    me.sort[idx] = sortType;

    const sort = me.#prepareSorter(me.sort, me.#sortOrder);

    if (me.storage) {
      return me.dataController.sort(sort);
    }

    me.data = GSData.sortData(me.data, sort);
    me.emit('sort');
  }

  #prepareSorter(sort, sortOrder) {
    const me = this;

    if (sort.filter(v => v).length === 0) {
      sort = Array(me.columns.length).fill(0);
      sort[me.key] = 1;
    }

    // if data record is object (not simple array)
    const isComplex = me.data[0] && !Array.isArray(me.data[0]);

    // sort list 
    const list = sort.map((v, i) => v ? { name: isComplex ? me.columns[i] : undefined, col: i, ord: v, idx: sortOrder.indexOf(i) } : null).filter(v => v);

    // order sort list by idx
    sort = GSData.sortData(list, [{ name: 'idx', ord: 1 }]);

    return sort;
  }

  #onSelect(e) {
    const me = this;
    if (!me.selectable) return;
    const tr = e.target.tagName === 'TR' ? e.target : e.target.closest('tr');
    if (!tr) return;
    const isSelected = me.selections.includes(tr.index);
    if (me.multiselect) {
      if (isSelected) {
        me.selections = me.selections.filter(v => v != tr.index);
      } else {
        me.selections.push(tr.index);
        me.requestUpdate();
      }
    } else {
      me.selections = isSelected ? [] : [tr.index];
    }
    me.emit('select');
  }

  #onKeyDown(e) {

    if (!e.target.matches('tbody tr')) return;
    let el = null;

    switch (e.code) {
      case 'ArrowUp':
        el = e.target.previousElementSibling;
        break;
      case 'ArrowDown':
        el = e.target.nextElementSibling;
        break;
    }

    if (el) {
      el.focus();
      this.emit('focus', el);
    }
  }

  #onKeyUp(e) {
    if (e.code === 'Space') this.#onSelect(e);
  }

  static {
    this.define('gs-table');
  }

}