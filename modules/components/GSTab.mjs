/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTab class
 * @module components/GSTab
 */

import GSElement from "../base/GSElement.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSID from "../base/GSID.mjs";
import GSItem from "../base/GSItem.mjs";

/**
 * Render tab panel
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSTab extends GSElement {

  // TAB CONTENT
  static CSS_PANE = 'p-4';
  //NAV BAR
  static CSS_NAV = '';
  // NAV ITEM WRAPER
  static CSS_NAV_WRAP = '';

  static {
    customElements.define('gs-tab', GSTab);
  }

  static get observedAttributes() {
    const attrs = ['data'];
    return GSUtil.mergeArrays(attrs, super.observedAttributes);
  }

  constructor() {
    super();
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    if (name === 'data') return this.load(newValue);
  }

  async getTemplate(val = '') {
    const me = this;
    const items = GSItem.genericItems(me);
    items.forEach(el => el.id = GSID.id);
    const tabs = items.map(el => me.#renderTab(el)).join('');
    const panes = items.map(el => me.#renderPane(el)).join('');
    const panel = me.#renderPanel(panes);

    const tab = me.#isVertical ? me.#renderTabsVertical(tabs) : me.#renderTabsHorizontal(tabs);
    const css = me.#isVertical ? `d-flex align-items-start ${me.#css}` : me.#css;
    const html = me.#isReverse ? panel + tab : tab + panel;
    return `<div class="${css}">${html}</div>`;
  }

  get #isReverse() {
    return this.#placement === 'end' || this.#placement === 'bottom';
  }

  get #isVertical() {
    return this.#placement === 'start' || this.#placement === 'end';
  }

  // start, end, top , bottom
  get #placement() {
    return GSUtil.getAttribute(this, 'placement', 'top');
  }

  get #cssnav() {
    return GSUtil.getAttribute(this, 'css-nav', 'nav-tabs');
  }

  get #csspane() {
    return GSUtil.getAttribute(this, 'css-pane');
  }

  #renderTabsVertical(tabs) {
    return `
      <div class="nav flex-column ${GSTab.CSS_NAV} ${this.#cssnav}" id="v-pills-tab" role="tablist" aria-orientation="vertical">
        ${tabs}
      </div>
    `;
  }

  #renderTabsHorizontal(tabs) {
    return `
      <ul class="nav ${GSTab.CSS_NAV} ${this.#cssnav}" "role="tablist">
        ${tabs}
      </ul>      
      `;
  }

  #renderPanel(panes) {
    return `     
        <div class="tab-content flex-fill ${GSTab.CSS_PANE} ${this.#csspane}">
          ${panes}
        </div>  
      `;
  }

  #renderTab(el) {
    const me = this;
    const wrap = me.#isVertical ? '' : `<li class="nav-item ${GSTab.CSS_NAV_WRAP} ${me.#cssNavWrap(el)}" role="presentation">`;
    const title = me.#title(el);
    const icon = me.#icon(el);
    const iconTpl = icon ? `<i class="${icon}"></i>` : '';
    //const contentTpl = me.rtl ? `${title} ${iconTpl}` : `${iconTpl} ${title}`;
    const contentTpl = `${iconTpl} ${title}`;

    return `${wrap}
          <a type="button" role="tab" is="gs-navlink"
              id="${el.id}-tab" 
              class="nav-link ${me.#cssNav(el)} ${me.#activeTabCSS(el)}" 
              aria-controls="${el.id}-tab"                 
              data-bs-target="#${el.id}-pane" 
              data-bs-toggle="tab">${contentTpl}</a>
          ${wrap ? '</li>' : ''}
      `;
  }

  #renderPane(el) {
    const me = this;
    return `
      <div  id="${el.id}-pane" aria-labelledby="${el.id}-tab" 
          class="tab-pane fade ${me.#cssPane(el)}  ${me.#activePaneCSS(el)}" 
          role="tabpanel">
          ${me.#body(el)}
      </div>        
      `;
  }

  #body(el) {
    const me = this;
    if (me.#template(el)) return `<gs-template href="${me.#template(el)}"></gs-template>`;
    const list = Array.from(el.childNodes).filter(el => !(el instanceof Text && el.data.trim().length == 0));
    if (list.length === 1 && list[0] instanceof Comment) return list[0].data;
    return el.innerHTML;
  }

  #active(el) {
    return GSUtil.getAttributeAsBool(el, 'active');
  }

  #activeTabCSS(el) {
    return this.#active(el) ? 'active' : '';
  }

  #activePaneCSS(el) {
    return this.#active(el) ? 'active show' : '';
  }

  #template(el) {
    return GSUtil.getAttribute(el, 'template');
  }

  #title(el) {
    return GSUtil.getAttribute(el, 'title');
  }

  #icon(el) {
    return GSUtil.getAttribute(el, 'icon');
  }

  #cssPane(el) {
    return GSUtil.getAttribute(el, 'css-pane');
  }

  #cssNav(el) {
    return GSUtil.getAttribute(el, 'css-nav');
  }

  #cssNavWrap(el) {
    return GSUtil.getAttribute(el, 'css-nav-wrap');
  }

  get #css() {
    return GSUtil.getAttribute(this, 'css', '');
  }

  /**
   * Load data from various sources
   * @param {JSON|func|url} val 
   */
  async load(val = '') {
    const data = await GSUtil.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    me.innerHTML = GSItem.generateItem(data);
    GSComponents.remove(me);
    GSListeners.deattachListeners(me);
    me.connectedCallback();
  }

}