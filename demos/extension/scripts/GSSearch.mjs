/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSSearch class
 * @module GSSearch
 */
import GSElement from "../../../modules/base/GSElement.mjs"
import GSUtil from "../../../modules/base/GSUtil.mjs";

/**
 * Search input box 
 * @class
 * @extends {GSElement}
 */
export default class GSSearch extends GSElement {

    static {
        customElements.define('gs-search', GSSearch);
        Object.seal(GSSearch);
    }

    async getTemplate() {
        const me = this;
        return `
        <div class="input-group ${me.css}">
            <i class="input-group-text ${me.iconCSS}"></i>
            <input type="search"  incremental="true" class="form-control ${me.inputCSS}" placeholder="${me.placeholder}" name="${me.name}">
        </div>        
        `
    }

    onReady() {
        const me = this;
        me.attachEvent(me.#searchEl, 'search', me.#onSearch.bind(me));
        super.onReady();
    }

    #onSearch(e) {
        GSUtil.preventEvent(e);
        const me = this;
        const opt = { type: 'search', action: 'search', value: me.#searchEl.value };
        GSUtil.sendEvent(me, 'action', opt, true, true, true);
    }

    get #searchEl() {
        return this.findEl('input');
    }

    get css() {
        return GSUtil.getAttribute(this, 'css', '');
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css', val);
    }

    get iconCSS() {
        return GSUtil.getAttribute(this, 'css-icon', 'bg-white bi bi-search');
    }

    set iconCSS(val = '') {
        return GSUtil.setAttribute(this, 'css-icon', val);
    }

    get inputCSS() {
        return GSUtil.getAttribute(this, 'css-input', 'border-start-0');
    }

    set inputCSS(val = '') {
        return GSUtil.setAttribute(this, 'css-input', val);
    }

    get placeholder() {
        return GSUtil.getAttribute(this, 'placeholder', 'search');
    }

    set placeholder(val = '') {
        return GSUtil.setAttribute(this, 'placeholder', val);
    }

    get name() {
        return GSUtil.getAttribute(this, 'name', 'search');
    }

    set name(val = '') {
        return GSUtil.setAttribute(this, 'name', val);
    }

}