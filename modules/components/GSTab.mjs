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
import GSLoader from "../base/GSLoader.mjs";
import GSEvent from "../base/GSEvent.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";

/**
 * Render tab panel
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSTab extends GSElement {

  // TAB CONTENT
  static CSS_PANE = '';
  //NAV BAR
  static CSS_NAV = '';
  // NAV ITEM WRAPER
  static CSS_NAV_WRAP = '';

  static {
    customElements.define('gs-tab', GSTab);
    Object.seal(GSTab);
  }

  static get observedAttributes() {
    const attrs = ['data'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    GSItem.validate(this, this.tagName);
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
    return GSAttr.get(this, 'placement', 'top');
  }

  get #cssnav() {
    return GSAttr.get(this, 'css-nav', 'nav-tabs');
  }

  get #csspane() {
    return GSAttr.get(this, 'css-pane');
  }

  #renderTabsVertical(tabs) {
    return `
      <div class="nav flex-column user-select-none ${GSTab.CSS_NAV} ${this.#cssnav}" id="v-pills-tab" role="tablist" aria-orientation="vertical">
        ${tabs}
      </div>
    `;
  }

  #renderTabsHorizontal(tabs) {
    return `
      <ul class="nav user-select-none ${GSTab.CSS_NAV} ${this.#cssnav}" "role="tablist">
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

    const actievCSS = me.#activeTabCSS(el);

    return `${wrap}
          <a type="button" role="tab" is="gs-ext-navlink"
              id="${el.id}-tab" 
              class="nav-link ${me.#cssNav(el)} ${actievCSS}" 
              aria-controls="${el.id}-tab"                 
              data-bs-target="#${el.id}-pane" 
              data-bs-toggle="tab">${contentTpl}</a>
          ${wrap ? '</li>' : ''}
      `;
  }

  #renderPane(el) {
    const me = this;
    return me.isFlat ? me.#renderPaneFlat(el) : me.#renderPaneShadow(el);
  }

  #renderPaneShadow(el) {
    const me = this;
    const actievCSS = me.#activePaneCSS(el);
    const body = GSItem.getBody(el);
    const slot = GSDOM.parseWrapped(me, body);
    GSAttr.set(slot, 'slot', el.id);
    GSDOM.appendChild(me, slot);
    return `
      <div  id="${el.id}-pane" aria-labelledby="${el.id}-tab" 
          class="tab-pane fade ${me.#cssPane(el)}  ${actievCSS}" 
          role="tabpanel">
          <slot name="${el.id}"></slot>
      </div>        
      `;
  }

  #renderPaneFlat(el) {
    const me = this;
    const actievCSS = me.#activePaneCSS(el);
    const body = GSItem.getBody(el, me.isFlat);
    return `
      <div  id="${el.id}-pane" aria-labelledby="${el.id}-tab" 
          class="tab-pane fade ${me.#cssPane(el)}  ${actievCSS}" 
          role="tabpanel">
          ${body}
      </div>        
      `;
  }

  #active(el) {
    return GSAttr.getAsBool(el, 'active');
  }

  #activeTabCSS(el) {
    return this.#active(el) ? 'active' : '';
  }

  #activePaneCSS(el) {
    return this.#active(el) ? 'active show' : '';
  }

  #title(el) {
    return GSAttr.get(el, 'title');
  }

  #icon(el) {
    return GSAttr.get(el, 'icon');
  }

  #cssPane(el) {
    return GSAttr.get(el, 'css-pane');
  }

  #cssNav(el) {
    return GSAttr.get(el, 'css-nav');
  }

  #cssNavWrap(el) {
    return GSAttr.get(el, 'css-nav-wrap');
  }

  get #css() {
    return GSAttr.get(this, 'css', '');
  }

  /**
   * Load data from various sources
   * 
   * @async
   * @param {JSON|func|url} val 
   * @returns {Promise}
   */
  async load(val = '') {
    const data = await GSLoader.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    const src = GSDOM.fromJsonAsString(data);
    GSDOM.setHTML(me, src);
    GSEvent.deattachListeners(me);
    me.disconnectedCallback();
    me.connectedCallback();
  }

}

