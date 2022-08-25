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
import GSLoader from "../base/GSLoader.mjs";
import GSEvent from "../base/GSEvent.mjs";
import GSAttr from "../base/GSAttr.mjs";

/**
 * Renderer for nav bar/list
 * @class
 * @extends {GSElement}
 */
export default class GSNav extends GSElement {

    static {
        customElements.define('gs-nav', GSNav);
        Object.seal(GSNav);
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
        return this.#getCssNav(this);
    }

    get #isBar() {
        return GSAttr.getAsBool(this, 'bar', true);
    }

    #wrap(el) {
        const me = this;
        return `<li class="nav-item ${me.#getCssNavWrap(el)}">${me.#btn(el)}</li>`;
    }

    #btn(el) {
        const me = this;
        const dataAttrs = GSAttr.dataToString(el);
        const cssnav = me.#getCssNav(el);
        const cssactive = me.#getCssActiveTab(el);
        const title = me.#getTitle(el);
        const icon = me.#getIcon(el);
        const iconTpl = icon ? `<i class="${icon}"></i>` : '';
        //const contentTpl = me.rtl ? `${title} ${iconTpl}` : `${iconTpl} ${title}`;
        const contentTpl = `${iconTpl} ${title}`;

        return `<a type="button" role="nav" is="gs-navlink" class="nav-link ${cssnav} ${cssactive}" id="${GSID.id}-nav"                
                ${GSItem.getDismissAttr(el)} ${GSItem.getTargetAttr(el)} 
                ${GSItem.getToggleAttr(el)} ${GSItem.getActionAttr(el)} 
                ${GSItem.getInjectAttr(el)} ${GSItem.getCSSAttr(el)}
                ${GSItem.getSelectableAttr(el)} ${dataAttrs}>${contentTpl}</a>`;

    }

    #getCssNavWrap(el) {
        return GSAttr.get(el, 'css-nav-wrap');
    }

    #getCssNav(el) {
        return GSAttr.get(el, 'css-nav');
    }

    #getCssActiveTab(el) {
        return this.#getActive(el) ? 'active' : '';
    }

    #getActive(el) {
        return GSAttr.getAsBool(el, 'active');
    }

    #getTitle(el) {
        return GSAttr.get(el, 'title');
    }

    #getIcon(el) {
        return GSAttr.get(el, 'icon');
    }

    /**
     * Load data from various sources
     * @param {JSON|func|url} val 
     */
    async load(val = '') {
        const data = await GSLoader.loadData(val);
        if (!GSUtil.isJsonType(data)) return;
        const me = this;
        me.innerHTML = GSItem.generateItem(data);
        GSEvent.deattachListeners(me);
        me.connectedCallback();
    }

}
