/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { html } from '../../lib.mjs';
import { TreeNode } from '../../data/TreeNode.mjs';
import { GSElement } from '../../GSElement.mjs';
import { GSLinklement } from '../Link.mjs';
import { GSAttributeHandler } from '../../base/GSAttributeHandler.mjs';

export class GSTreeItemElement extends GSElement {

  /*
  static styles = css`            
    :focus-visible {
      outline: none !important;
    }  
    .list-group-item {
      cursor: pointer;
    }`;
    */

  static properties = {
    loading: { state: true },
    node: { type: Object, hasChanged: (newVal) => newVal instanceof TreeNode }
  }

  constructor() {
    super();
    this.flat = true;
  }

  shouldUpdate(changed) {
    return this.node ? true : false;
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has('node')) this.node[Symbol.for('gs-element')] = this;
  }

  updated() {
    if (this.focused) this.query('a')?.focus();
    this.dataset.visible = this.visible;
  }

  renderUI() {
    const me = this;
    const node = me.node;
    const opt = me.value || {};
    opt.tooltip = me.translate(opt.tooltip)
    opt.title = me.translate(opt.title)
    const before = me.loading ? me.#renderSpinner(node.level) : me.#renderIcon(node.level);
    return GSLinklement.generate(opt, me.renderClass(), before);
  }

  renderClass() {
    const me = this;
    const opt = {
      'list-group-item': true,
      'list-group-item-action': true,
      'user-select-none  ': true,
      'border-0': me.#border ? false : true,
      'gs-hide': !me.visible
    };
    return me.mapCSS(me.#cssFocus, me.mapCSS(me.#cssSelected, opt, me.selected && !me.multiselect), me.focused);
  }

  /**
   * Toggle folder
   */
  toggle() {
    this.opened ? this.close() : this.open();
  }

  /**
   * Open folder
   */
  open() {
    this.#status(true);
    this.focus();
  }

  /**
   * Close folder
   */
  close() {
    this.#status(false);
  }

  focus(val = true) {
    if (val) super.focus();
    this.focused = val == true;
  }

  select(val = true) {
    this.selected = val == true;
  }

  handle(e) {
    GSAttributeHandler.process(this.querySelector('a'), e);
  }

  get isLeaf() {
    return this.node?.isLeaf;
  }

  get isFolder() {
    return !this.isLeaf;
  }

  get key() {
    return this.node?.key;
  }

  get value() {
    return this.node?.value || {};
  }

  get level() {
    return this.node?.level || -1;
  }

  get focused() {
    return this.node?.focused;
  }

  get visible() {
    const parent = this.parent;
    return parent?.opened || parent?.level === -1;
  }

  get parent() {
    return this.node?.parent;
  }

  get parentItem() {
    const item = this.parent?.[Symbol.for('gs-element')];
    return item instanceof GSTreeItemElement ? item : undefined;
  }

  set focused(val) {
    val = val === true;
    this.node.focused = val;
  }

  get selected() {
    return this.node?.selected;
  }

  set selected(val) {
    val = val === true;
    const me = this;
    if (me.isFolder && me.owner.leaf) val = false;

    if (me.multiselect) {
      if (val) {
        me.node.selectAll();
      } else {
        me.node.deselectAll();
      }
    } else {
      me.node.selected = val;
    }
  }

  get opened() {
    return this.node?.opened;
  }

  set opened(val) {
    this.#status(val === true);
  }

  get owner() {
    return this.closest('gs-tree');
  }

  get multiselect() {
    return this.owner.multiselect;
  }

  get #cssFocus() { return this.owner.cssFocus || 'focus-ring'; }
  get #cssSelected() { return this.owner.cssSelected || 'active'; }
  get #cssCheck() { return this.owner.cssCheck || ''; }
  get #checkColor() { return this.owner.checkColor || 'secondary'; }
  get #checkColorSelected() { return this.owner.checkColorSelected || 'primary'; }

  get #border() {
    return this.value?.border === true || this.owner.border === true;
  }

  get #icon() {
    const me = this;
    const node = me.node;
    const data = me.value;
    const ui = me.owner;
    let itemIco = data.icon || ui.itemIcon;
    if (node.isFolder) itemIco = node.opened ? (data.openIcon || ui.openIcon) : (data.closeIcon || ui.closeIcon);
    return itemIco;
  }

  #renderIndent(level) {
    return html`<gs-indent size="${level}"></gs-indent>`;
  }

  #renderSpinner(level) {
    return html`${this.#renderIndent(level)}<gs-spinner small></gs-spinner>`;
  }

  #renderIcon(level) {
    return html`${this.#renderIndent(level)}${this.#renderMulti()}<gs-icon size="5" name="${this.#icon}"></gs-icon>`;
  }

  #renderMulti() {
    const me = this;
    if (!me.multiselect) return '';
    const color = me.selected ? me.#checkColorSelected : me.#checkColor;
    const icon = me.node.isPartialySelected ? 'dash-square-fill' : me.selected ? 'check-square-fill' : 'square';
    return html`<gs-icon size="6" data-type="state" 
                css="me-1 text-${color} ${me.#cssCheck}"
                name="${icon}"></gs-icon>`;
  }

  #status(val = false) {
    const me = this;
    if (me.node?.isFolder) {
      me.node.opened = val;
    }
  }

  static {
    this.define('gs-tree-item');
  }

}