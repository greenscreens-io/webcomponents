/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSList class
 * @module components/GSList
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSItem from "../base/GSItem.mjs";

/**
 * Renderer for bootstrap list group 
 * <gs-list css="">
 *     <gs-item css="" action="" target="" toggle="" target="" dismiss="" template="" title="">
 * </gs-list>
 * @class
 * @extends {GSElement}
 */
export default class GSList extends GSElement {


    static {
        customElements.define('gs-list', GSList);
    }

    static get observedAttributes() {
        const attrs = ['data'];
        return GSUtil.mergeArrays(attrs, super.observedAttributes);
    }

    constructor() {
        super();
    }

    get css() {
        return GSUtil.getAttribute(this, 'css', '');
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css', val);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        if (name === 'data') return this.load(newValue);
    }

    async getTemplate(val = '') {
        const me = this;
        const html = await me.#render();
        return `<div class="list-group ${me.css}">${html}</div>`;
    }

    async #render() {
        const me = this;
        const list = GSItem.genericItems(me).map(el => me.#html(el));
        const html = await Promise.all(list);
        return html.join('');
    }

    async #html(el) {
        const me = this;
        const message = me.#title(el);
        const tpl = await GSItem.getTemplate(el);
        const css = me.#getCSS(el);
        const href = me.#getHref(el);
        const action = GSItem.getActionAttr(el);
        const dissmis = GSItem.getDismissAttr(el);
        const target = GSItem.getTargetAttr(el);
        const toggle = GSItem.getToggleAttr(el);

        const active = me.#getActive(el) ? 'active' : '';
        const select = me.selectable ? 'is="gs-navlink"' : 'ignore';

        return `<a  ${select} class="list-group-item list-group-item-action ${active} ${css}"
                href="${href}" ${action} ${toggle} ${target} ${dissmis}>
                ${tpl || message}
                </a>`;
    }

    #title(el) {
        return GSUtil.getAttribute(el, 'title');
    }

    #getCSS(el) {
        return GSUtil.getAttribute(el, 'css', '');
    }

    #getActive(el) {
        return GSUtil.getAttributeAsBool(el, 'active');
    }

    get selectable() {
        return GSUtil.getAttributeAsBool(this, 'selectable', true);
    }

    #getHref(el) {
        return GSUtil.getAttribute(el, 'href', "#");
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
