/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSNav class
 * @module components/GSNav
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSID from "../base/GSID.mjs";
import GSItem from "../base/GSItem.mjs";

/**
 * Renderer for nav bar/list
 * @class
 * @extends {GSElement}
 */
export default class GSNav extends GSElement {

    static {
        customElements.define('gs-nav', GSNav);
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
        //const btns = items.map( el => el.getTemplate()).join('');
        const btns = items.map(el => me.#getTemplateChild(el));
        //const tag = me.#isBar ? 'nav' : 'ul';
        const css = me.#isBar ? '' : 'flex-column';

        return `
          <ul class="nav ${css} ${me.#cssnav}">
            ${btns.join('')}
          </ul>
        `;
    }

    #getTemplateChild(el) {
        const me = this;
        // return me.#isBar ? me.#btn(el) : me.#wrap(el);
        return me.#wrap(el);
    }

    get #cssnav() {
        return GSUtil.getAttribute(this, 'css-nav');
    }

    get #isBar() {
        return GSUtil.getAttributeAsBool(this, 'bar', true);
    }

    #wrap(el) {
        const me = this;
        return `<li class="nav-item ${me.#getCssNavWrap(el)}">${me.#btn(el)}</li>`;
    }

    #btn(el) {
        const me = this;
        const cssnav = me.#getCssNav(el);
        const cssactive = me.#getCssActiveTab(el);
        const title = me.#getTitle(el);
        const icon = me.#getIcon(el);
        const iconTpl = icon ? `<i class="${icon}"></i>` : '';
        //const contentTpl = me.rtl ? `${title} ${iconTpl}` : `${iconTpl} ${title}`;
        const contentTpl = `${iconTpl} ${title}`;

        return `<a type="button" role="nav" is="gs-navlink" class="nav-link ${cssnav} ${cssactive}"  id="${GSID.id}-nav">${contentTpl}</a>`;
    }

    #getCssNavWrap(el) {
        return GSUtil.getAttribute(el, 'css-nav-wrap');
    }

    #getCssNav(el) {
        return GSUtil.getAttribute(el, 'css-nav');
    }

    #getCssActiveTab(el) {
        return this.#getActive(el) ? 'active' : '';
    }

    #getActive(el) {
        return GSUtil.getAttributeAsBool(el, 'active');
    }

    #getTitle(el) {
        return GSUtil.getAttribute(el, 'title');
    }

    #getIcon(el) {
        return GSUtil.getAttribute(el, 'icon');
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
