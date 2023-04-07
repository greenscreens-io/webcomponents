/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */

/**
 * A module loading GSTag class
 * @module components/GSTag
 */

import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSElement from "../base/GSElement.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSItem from "../base/GSItem.mjs";

/**
 * Tag list element
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSTag extends GSElement {

    static {
        GSCacheStyles.adopt(GSTag.#style);
        customElements.define('gs-tag', GSTag);
        Object.seal(GSTag);
    }

    static get #style() {
        return `
        .tag-input:focus-visible {
            outline:none;
        }
        .tag .btn-close {
            background: none;
        }            
        .tag .btn-close::after {
            content: 'x';
        }`;
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    async getTemplate(val = '') {
        const me = this;
        const items = me.#renderList();
        const tags = me.#renderTags();
        return `
        <div class="d-flex flex-wrap align-items-center gap-1 ${me.css}">
            ${tags}
            <input list="${me.name}_list" name="${me.name}" type="text" class="form-control d-flex w-auto flex-grow-1" placeholder="${me.placeholder}">
            <datalist id="${me.name}_list">${items}</datalist>
        </div>`;
    }

    onReady() {
        const me = this;
        me.attachEvent(me.query('div'), 'click', me.#onClick.bind(me));
        me.attachEvent(me.#input, 'keydown', me.#onKeyDown.bind(me));
        me.attachEvent(me.#input, 'input', me.#onInput.bind(me));
        super.onReady();
    }

    #onInput(e) {
        if (!e.inputType) this.#updateTag(e);
    }

    #onKeyDown(e) {
        if (['Enter', 'NumpadEnter', 'Comma', 'Space'].indexOf(e.code) < 0) return;        
        this.#updateTag(e);
    }

    #onClick(e) {
        const isClose = e.srcElement === e.target && e.target instanceof HTMLButtonElement;
        if (isClose) this.#removeTag(e.target.parentElement);
    }

    #updateTag(e) {
        GSEvents.prevent(e);
        const me = this;
        me.#addTag(me.#selected);
    }

    get #isMax() {
        const me = this;
        return me.max > 0 && me.#data.length >= me.max;
    }

    get #data() {
        return this.queryAll('.tag').map(el => el.dataset.value);
    }

    get #options() {
        return Array.from(this.#datalist.children);
    }

    get #selected() {
        const me = this;
        return me.#options.filter(el => el.value.toLowerCase() === me.#input.value.toLowerCase()).pop();        
    }

    get #isDuplicate() {
        const me = this;
        const val = me.#input.value.toLowerCase();
        return me.values.filter( v => v.toLowerCase() === val).length > 0 ;
    }

    #addTag(optEl) {
        const me = this;
        const fld = me.#input;
        if (me.#isMax ||(!optEl && me.allowAdd == false)) {
            fld.value = '';
            return;
        }
        if (me.#isDuplicate) return;
        const src = me.#renderTag(fld.value);
        const el = GSDOM.parse(src, true);
        fld.insertAdjacentElement('beforebegin', el);
        fld.value = '';
        optEl?.remove();
        me.values = me.#data.join(',');
    }
    
    #removeTag(tagEl) {
        if (!tagEl) return;
        const me = this;
        const opt  = document.createElement('option');
        opt.value = tagEl.dataset.value;
        me.#datalist.appendChild(opt);
        tagEl.remove();
        me.values = me.#data.join(',');
    }

    #renderList() {
        const me = this;
        const items = GSItem.genericItems(me);
        return items.map(el => `<option value="${el.name}">`).join('');
    }

    #renderTags() {
        const me = this;
        return me.values.map(v => me.#renderTag(v)).join('');
    }

    #renderTag(val = '') {
        if (!val) return '';
        const me = this;
        return `<div class="badge tag ${me.cssTag}" data-value="${val}">${val}<button type="button" class="btn-close ms-1 ${me.cssClose}"></button></div>`;
    }
  
    get #input() {
        return this.query('input');
    }

    get #datalist() {
        return this.query('datalist');
    }

    get allowAdd() {
        return GSAttr.getAsBool(this, 'allowadd', false);
    }

    set allowAdd(val = false) {
        return GSAttr.betAsBool(this, 'allowadd', val);
    }

    get max() {
        return GSAttr.getAsNum(this, 'max', 0);
    }

    set max(val = 0) {
        return GSAttr.setAsNum(this, 'max', val);
    }

    get values() {
        return GSAttr.get(this, 'values', '').split(',').map(v => v.trim());
    }

    set values(val = '') {
        return GSAttr.set(this, 'values', val);
    }

    get placeholder() {
        const me = this;
        const alt = me.max > 0 ? `Add max ${me.max} tags...` : '';
        return GSAttr.get(this, 'placeholder', alt);
    }

    set placeholder(val = '') {
        return GSAttr.set(this, 'placeholder', val)
    }    

    get css() {
        return GSAttr.get(this, 'css', '')
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }  

    get cssTag() {
        return GSAttr.get(this, 'css-tag', 'bg-secondary')
    }

    set cssTag(val = '') {
        return GSAttr.set(this, 'css-tag', val);
    }    

    get cssClose() {
        return GSAttr.get(this, 'css-close', 'text-bg-light')
    }

    set cssClose(val = '') {
        return GSAttr.set(this, 'css-close', val);
    }    

}