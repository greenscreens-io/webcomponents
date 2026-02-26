/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { classMap, html, css, createRef, ref, repeat, ifDefined } from '../../lib.mjs';
import { KEY } from '../../base/GSConst.mjs';
import { GSElement } from '../../GSElement.mjs';
import { GSDOM } from '../../base/GSDOM.mjs';
import { TreeNode } from '../../data/TreeNode.mjs';
import { TreeController } from './controllers/TreeController.mjs';
import { color } from '../../properties/color.mjs';

export class GSTreeElement extends GSElement {

  static styles = css`            
    :focus-visible {
      outline: none !important;
    }  
    .list-group-item {
      cursor: pointer;
    }`;

  static shared = {
    itemIcon: { attribute: 'icon-item' },
    closeIcon: { attribute: 'icon-close' },
    openIcon: { attribute: 'icon-open' },
    cssCheck: { attribute: 'css-check' },
    cssFocus: { attribute: 'css-focus' },
    cssSelected: { attribute: 'css-selected' },
    checkColor: { attribute: 'check-color', ...color },
    checkColorSelected: { attribute: 'check-color-selected', ...color },
  }

  static properties = {
    storage: {},
    data: { type: Object },
    node: { type: Object, hasChanged: (newVal) => newVal instanceof TreeNode },
    border: { type: Boolean, reflect: true },
    guide: { type: Boolean, reflect: true },
    leaf: { type: Boolean, reflect: true },
    multiselect: { type: Boolean, reflect: true },
    circular: { type: Boolean, reflect: true },
    ...GSTreeElement.shared
  }

  // GS-ITEM attributes mapping
  static options = {
    ...GSTreeElement.shared,
    css: {},
    icon: {},
    color: {},
    title: {},
    tooltip: {},
    opened: { type: Boolean },
    selected: { type: Boolean }
  }

  #queued = false;
  #listRef = createRef();

  #controller = null;

  constructor() {
    super();
    const me = this;
    me.leaf = false;
    me.multiselect = false;
    me.data = GSDOM.toJson(me, true, true).items;
    me.node = new TreeNode(null, { '#tagName': this.tagName }, null, -1);
    me.itemIcon = 'file-earmark';
    me.closeIcon = 'folder'; // caret-right; chevron-right
    me.openIcon = 'folder2-open'; // caret-down; chevron-down
    me.cssSelected = 'active'; // fw-bold
    me.cssFocus = 'focus-ring';
    me.node[KEY] = me;
    me.#controller = new TreeController(me);
  }

  renderUI() {
    const me = this;
    return html`<div  dir="${ifDefined(me.direction)}"
          class="treeview ${classMap(me.renderClass())}"          
          @click="${me.#onClick}"
          @keydown="${me.#onKeyDown}"
          @keyup="${me.#onKeyUp}">
          <div class="list-group" ${ref(me.#listRef)}>
          ${repeat(me.node.walk(me.node, false, false), (node) => node.key, (node) => html`
            <gs-tree-item .node="${node}"></gs-tree-item>
          `)}
          </div>    
        </div>`;
  }

  shouldUpdate(changed) {
    const me = this;
    if (changed.has('data') && me.data && !me.#queued) {
      me.#queued = true;
      queueMicrotask(() => {
        me.node.clear();
        me.node.fromJSON(me.data);
        me.#queued = false;
        me.requestUpdate();
      });
    }
    return this.node ? true : false;
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has('multiselect') && !this.multiselect) this.node?.deselectAll();
    this.node.multi = this.multiselect;
  }

  onDataRead(data) {
    if (data instanceof TreeNode) {
      if (data.root !== this.node) this.node = data;
    } else {
      this.data = data;
    }
  }

  next(expand = false) {
    const me = this;
    let item = me.nextItem;
    if (!item & me.circular) item = me.#first;
    if (item?.visible) {
      item.focus();
      if (expand && me.focused?.isFolder) me.focused.open();
    }
    return me.focused;
  }

  previous(collapse = false) {
    const me = this;
    let item = me.previousItem;
    if (!item & me.circular) item = me.#last;
    if (item?.visible) {
      item.focus();
      if (item.isFolder && collapse) item.close();
    }
    return me.focused;

  }

  expandAll() {
    this.node?.expandAll();
  }

  collapseAll() {
    this.node?.collapseAll();
  }

  /**
   * Open folder
   */
  open(path) {
    const me = this;
    me.focused?.open();
  }

  /**
   * Close folder
   * TODO - path navigation
   */
  close(path) {
    const me = this;
    me.focused?.close();
  }

  clear() {
    this.node?.clear();
    this.requestUpdate();
  }

  reload() {
    this.clear();
    this.dataController?.read();
  }

  get selected() {
    return this.#host(this.node.selectedNodes());
  }

  get focused() {
    return this.#host(this.node.focusedNode());
  }

  /**
   * Previous visible ge-node-item
   */
  get previousItem() {
    return this.focused?.node.find(n => n?.visible, true, true)?.[KEY];
  }

  /**
   * Next visible ge-node-item
   */
  get nextItem() {
    return this.focused?.node.find(n => n?.visible, true)?.[KEY];
  }

  get #list() {
    return this.#listRef.value;
  }

  get #first() {
    return this.#list.firstElementChild;
  }

  get #last() {
    return this.#list.lastElementChild;
  }

  #host(node) {
    return Array.isArray(node) ? node.map(n =>n[KEY]).filter(n => n) : node?.[KEY];
  }

  #onClick(e) {
    const icon = e.target.tagName === 'GS-ICON' ? e.target : e.target.closest('gs-icon');
    const isIcon = icon?.dataset.type === 'state';
    const el = e.target.closest('gs-tree-item');
    if (!el.node) return;

    const me = this;

    if (me.multiselect) {
      if (isIcon) el.toggleSelection();
    } else {
      el.select(true);
    }

    const expandable = (me.multiselect && !isIcon) || (!me.multiselect);
    if (el.isFolder && expandable) el.toggle();

    el.focus();
    el.handle(e);
  }

  #onKeyDown(e) {

    const me = this;
    const el = me.focused;
    if (!el) return;

    switch (e.code) {
      case 'ArrowUp':
        me.previous();
        break;
      case 'ArrowDown':
        me.next();
        break;
      case 'ArrowLeft':
        if (el.isFolder) {
          if (el.opened) {
            me.close();
          } else {
            (el.parentItem || el)?.focus();
          }
        } else {
          me.previous();
        }
        break;
      case 'ArrowRight':
        if (el.isFolder && !el.opened) {
          me.open();
        } else {
          me.next();
        }
        break;
      case 'Enter':
          if (el.isFolder) {
            el.toggle();
          }        
    }
  }

  #onKeyUp(e) {

    const el = e.target.closest('gs-tree-item');
    if (!(el?.node)) return;

    switch (e.code) {
      case 'Enter':
        el.handle(e);
        break;
      case 'Tab':
        el.focus();
        break;
      case 'Space':
        el.select(this.multiselect ? !el.selected : true);
        el.focus();
        break;
    }
  }

  static {
    this.define('gs-tree');
  }

}