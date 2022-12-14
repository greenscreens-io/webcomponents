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
import GSLoader from "../base/GSLoader.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";

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
        Object.seal(GSList);
    }

    static get observedAttributes() {
        const attrs = ['data'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
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
        //const html = await Promise.all(list);
        // return html.join('');
        return list.join('');
    }

    //async 
    #html(el) {
        const me = this;
        const message = me.#title(el);
        //const tpl = await GSItem.getTemplate(el);
        const tpl = GSItem.getBody(el);
        const css = GSItem.getCSS(el);
        const href = GSItem.getHref(el);

        const dataAttrs = GSAttr.dataToString(el);
        const dataBS = GSItem.getAttrs(el);

        const icon = GSItem.getIcon(el);
        const icoCSS = icon ? `<i class="${icon}"></i>` : ''

        const active = me.#getActive(el) ? 'active' : '';
        const select = me.selectable ? 'is="gs-ext-navlink"' : 'ignore';
        const hreftgt = href && href !== '#' ? `target=${GSItem.getTarget(el)}` : '';

        return `<a  ${select} class="list-group-item list-group-item-action ${active} ${css}"
                href="${href}" ${hreftgt} ${dataBS} ${dataAttrs}>${icoCSS} ${tpl || message}</a>`;
    }

    #title(el) {
        return GSAttr.get(el, 'title');
    }

    #getActive(el) {
        return GSAttr.getAsBool(el, 'active');
    }

    get selectable() {
        return GSAttr.getAsBool(this, 'selectable', true);
    }

    /**
     * Load data from various sources
     * 
     * @param {JSON|func|url} val 
     * @async
     * @returns {Promise}
     */
    async load(val = '') {
        const data = await GSLoader.loadData(val);
        if (!GSUtil.isJsonType(data)) return;
        const me = this;
        const src = GSDOM.fromJsonAsString(data);
        GSDOM.setHTML(me, src);
        me.disconnectedCallback();
        me.connectedCallback();
        return data;
    }

}

