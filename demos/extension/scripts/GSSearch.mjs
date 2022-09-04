/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSSearch class
 * @module GSSearch
 */
import GSAttr from "../../../modules/base/GSAttr.mjs";
import GSElement from "../../../modules/base/GSElement.mjs"
import GSEvent from "../../../modules/base/GSEvent.mjs";

/**
 * Search input box WebComponent which emits searh event to upper tree.
 * In this cse for GSTable filtering
 * @class
 * @extends {GSElement}
 */
class GSSearch extends GSElement {

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
        GSEvent.prevent(e);
        const me = this;
        const opt = { type: 'search', action: 'search', value: me.#searchEl.value };
        GSEvent.send(me, 'action', opt, true, true, true);
    }

    get #searchEl() {
        return this.query('input');
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get iconCSS() {
        return GSAttr.get(this, 'css-icon', 'bg-white bi bi-search');
    }

    set iconCSS(val = '') {
        return GSAttr.set(this, 'css-icon', val);
    }

    get inputCSS() {
        return GSAttr.get(this, 'css-input', 'border-start-0');
    }

    set inputCSS(val = '') {
        return GSAttr.set(this, 'css-input', val);
    }

     /**
     * Input box info mesasge
     * @returns {string}
     */
    get placeholder() {
        return GSAttr.get(this, 'placeholder', 'search');
    }

    set placeholder(val = '') {
        return GSAttr.set(this, 'placeholder', val);
    }

    /**
     * Input box name
     * @returns {string}
     */
    get name() {
        return GSAttr.get(this, 'name', 'search');
    }

    set name(val = '') {
        return GSAttr.set(this, 'name', val);
    }

}
