/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, css, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { color } from '../properties/color.mjs';
import { GSData } from '../base/GSData.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSID } from '../base/GSID.mjs';

/**
 * A HTML Table renderer for tabular data representation.
 * Either use "storage" property to point to data handler
 * or use simpler form by using "data" property.
 * 
 * NOTE: Simpler form currently does not suport data filter.
 * Simpler form is only for read-ony static data representation.
 */
export class GSTableElement extends GSElement {

  static #icons = ['sort-up', 'arrow-down-up', 'sort-down-alt'];

  static styles = css`th:hover { opacity: 50% !important; }`;

  static CELLS = {
    align: {},
    width: {},
    width: {},
    css: {},
    title: {},
    filter: { type: Boolean },
    fixed: { type: Boolean },
    filterType: { attribute: 'filter-type' },
    cssFilter: { attribute: 'css-filter' },
    cssHeader: { attribute: 'css-header' },
    ...GSData.PROPERTIES
  }

  static properties = {
    storage: {},
    color: { ...color },
    colorHead: { ...color, attribute: 'head-color' },
    colorSelect: { ...color, attribute: 'select-color' },
    colorSort: { ...color, attribute: 'sort-color' },
    stripedColumn: { type: Boolean, attribute: 'striped-column' },
    cssFilter: { attribute: 'css-filter' },
    cssHeader: { attribute: 'css-header' },
    divider: { type: Boolean },
    striped: { type: Boolean },
    hover: { type: Boolean },
    small: { type: Boolean },
    grid: { type: Boolean },
    borderless: { type: Boolean },

    sort: { type: Array, state: true },
    columns: { type: Array, state: true },
    key: { type: Number, state: true },

    data: { type: Array },
    datacolumn: { type: Boolean },
    multisort: { type: Boolean },
    multiselect: { type: Boolean },
    protected: { type: Boolean },
    selectable: { type: Boolean },
    toggle: { type: Boolean },
    sortable: { type: Boolean },
  }

  #config = [];
  #sortOrder = [];
  #auto = false;

  constructor() {
    super();
    this.headColor = 'secondary';
    this.colorSelect = 'info';
    this.columns = [];    
    this.data = [];
    this.sort = [];
    this.key = 0;
  }

  get selected() {
    return this.dataController.selected;
  }

  set search(val) {
    const me = this;
    if (me.storage && me.dataController) {
      return me.dataController.search = val;
    }
  }

  connectedCallback() {
    const me = this;
    me.#config = GSItem.proxify(me, GSTableElement.CELLS);
    if (me.columns.length === 0) me.columns = me.#config.map(v => v.name);
    if (!me.storage) {      
      me.storage = me.#auto = GSID.next('table-');
    }
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.dataController.clearSelected(this.data);
    this.data = [];
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

  firstUpdated() {
    this.dataController?.read();
  }

  willUpdate(changed) {
    const me = this;
    if (me.columns.length != me.sort.length) me.sort = Array(me.columns.length).fill(0);
    if (me.datacolumn && me.data.length > 0) {
      me.columns = me.data[0];
      me.data = me.data.slice(1);
    }
    if (changed.has('multiselect') && !me.multiselect) me.dataController.clearSelected();
    if (changed.has('selectable') && !me.selectable) me.dataController.clearSelected();
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
        <tbody @click=${me.#onSelect} @contextmenu=${me.#onSelect} class="${me.divider ? 'table-group-divider' : ''}" role="button">
          ${me.data.map((entry, index) => me.#renderRecord(entry, index))}
          ${me.#renderEmpty()}
        </tbody>
      </table>
      <slot name="extra">${me.#renderHandler()}</slot>
    `;
  }

  #renderHandler() {
    const me = this;
    return me.#auto ? html`<gs-data-handler type="cached" mode="" id=${me.#auto} generated></gs-data-handler>` : '';
  }

  onDataRead(data) {
    const me = this;
    me.data = data;
    //me.dataController.clearSelected();

    // update filtering
    if (data.length > 0 && me.#hasFilters) {
      me.#config.forEach((entry, index) => {
        entry.columnType = me.#columType(index);
      });
    }
  }

  /**
   * Clear table filters
   */
  clear() {
    this.#input.forEach(el => el.value = '');
    this.dataController?.filter([]);
  }

  valueAt(row, cell) {
    return this.data.length > row ? this.data[row][cell] : undefined;
  }

  get #input() {
    return this.queryAll('th > input, th > select', true);
  }

  get #hasFilters() {
    return this.#config.filter(o => o.filter).length > 0;
  }

  #columType(index) {
    const me = this;
    const cfg = me.#config[index];
    const cell = me.valueAt(0, me.columns[index]);
    cfg.type = cfg.type || 'text';
    const cfgType = { 'string': 'text', 'currency': 'number', 'timestamp': 'datetime-local' }[cfg.type]
    const dataType = cell instanceof Date ? 'date' : typeof cell;
    return cell ? dataType : cfgType || cfg.type;
  }

  #renderFilters() {
    const me = this;
    return me.#hasFilters ? html`<tr>${me.columns.map((entry, index) => me.#renderFilter(entry, index))}</tr>` : '';
  }

  #renderFilter(cell, index) {
    const me = this;
    const cfg = me.#config[index];
    if (!cfg?.filter) return html`<th></th>`;
    let mask = '';
    const hasSub = cfg.childElementCount > 0;
    const isDate = cfg.columnType === 'date';
    if (isDate) mask = cfg.format || GSUtil.getDateFormat(cfg.locale || GSUtil.locale);
    const css = `${GSUtil.normalize(me.cssFilter)} ${GSUtil.normalize(cell.cssFilter)}`; 

    if (hasSub && cfg.fixed) {
      return html`<th .index=${index} @change="${me.#onFilter}">
          <select is="gs-ext-select" .index=${index}
              class="form-select ${css}" 
              name="${cell}"> 
              ${me.#renderOption(cfg)}
              </select>
          </th>`;
    }

    let listid = '';
    let list = '';
    if (hasSub) {
      listid = `${me.id}-list-${index}`;
      list = html`<datalist id="${listid}">${me.#renderOption(cfg)}</datalist>`;
    } 

    return html`<th .index=${index} @change="${me.#onFilter}">
        ${list}
        <input is="gs-ext-input" .index=${index}
            class="form-control ${css}" 
            mask="${ifDefined(mask)}"
            list="${ifDefined(listid)}"
            name="${cell}" 
            type="${cfg.filterType || cfg.columnType}"
            data-slots="${ifDefined(isDate ? 'DMY' : undefined)}">
        </th>`;
  }

  #renderOption(cfg) {
    if (cfg.childElementCount == 0) return '';
    const sub = GSItem.proxify(cfg);
    return sub.map(el => html`<option value="${el.value}">${cfg.fixed ? el.map : ''}</option>`);
  }

  #renderColumn(cell, index) {
    const me = this;
    const cfg = me.#config[index];
    const css = `${GSUtil.normalize(me.cssHeader)} ${GSUtil.normalize(cell.cssHeader)}`; 
    return html`
      <th .index=${index} class="${css}" width="${ifDefined(me.#config[index]?.width)}">
        <div class="d-flex justify-content-between"> 
          <span>${cfg?.title || cell}</span>
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
    return html`<gs-icon name="${icons[sortType + 1]}" super="${order > 0 ? order : ''}" color="${ifDefined(me.colorSort)}"></gs-icon>`;
  }

  #renderRecord(entry, index) {
    const me = this;
    const selected = me.dataController.isSelected(entry);
    const color = me.colorSelect && selected ? `table-${me.colorSelect}` : '';
    const cells = me.#remapRecord(entry);
    return html`
        <tr .index=${index} class="${color}" tabindex="0" ?selected=${selected}>
          ${cells.map((cell, i) => html`<td class="text-${me.#config[i]?.align}"><span>${cell}</span></td>`)}
        </tr>
      `;
  }

  #remapRecord(record) {
    const me = this;
    if (!Array.isArray(record)) record = me.columns.map(v => record[v]);
    return record.map((val, i) => me.#config[i] ? GSData.format(me.#config[i], val) : val);
  }

  #renderEmpty() {
    const me = this;
    return me.data.length > 0 ?  '' :
    html`<tr data-ignore="true"><td colspan="${me.columns.length}" class="text-center fw-bold text-muted">${me.translate('No Data')}</td></tr>`;
  }

  #elementTofilter(el) {
    if (!el.value) return undefined;
    const isDate = el.type === 'date';
    const val = isDate ? el.valueAsDate : el.value;
    const cfg = this.#config[el.index];
    return { name: el.name, value: val, locale : cfg?.locale };
  }

  #onFilter(e) {
    
    const me = this;
    
    const filter = me.#input
      .map(el => me.#elementTofilter(el))
      .filter(el => el?.value);

    if (me.storage) {
      me.dataController.filter(filter);
    } else {
      // TODO keep full data, use sorted
      // GSData.filter(me.data, filter);
    }
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
      me.dataController?.sort(sort);
    } else {
      me.data = GSData.sortData(me.data, sort);
    }

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
    
    // if context menu is attached and right click made
    if (e.button === 2 && !me.query('gs-context')) return;
    
    const record = me.data[tr.index];
    const isSelected = me.dataController.isSelected(record);
    if (me.multiselect) {
      if (isSelected) {
        me.dataController.removeSelected(record);
      } else {
        me.dataController.addSelected(record);
      }
    } else if (me.toggle) {
      if (isSelected) {
        me.dataController.clearSelected(me.data);
      } else {
        me.dataController.addSelected(record);
      }
    } else {
      me.dataController.clearSelected(me.data);
      me.dataController.addSelected(record);
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