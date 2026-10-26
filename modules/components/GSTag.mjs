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
import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Tag list element
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSTag extends GSElement {

    static #KEYS = ['Enter', 'NumpadEnter', 'Comma', 'Space'];

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
        return this.allowAdd ? me.#editable(tags, items) : me.#selectable(tags, items);
    }

    #selectable(tags, items) {
        const me = this;
        return `
        <div class="d-flex flex-wrap align-items-center gap-1 ${me.css}">
            ${tags}
            <select id="${me.name}">${items}</select>
        </div>`;
    }    

    #editable(tags, items) {
        const me = this;
        return `
        <div class="d-flex flex-wrap align-items-center gap-1 ${me.css}">
            ${tags}
            <input list="${me.name}_list" name="${me.name}" type="text" class="form-control d-flex w-auto flex-grow-1" placeholder="${me.placeholder}">
            <datalist id="${me.name}_list">${items}</datalist>
        </div>`;
    }

    onReady() {
        super.onReady();
        const me = this;
        me.attachEvent(me.query('div'), 'click', me.#onClick.bind(me));
        me.attachEvent(me.#select, 'change', me.#onSelect.bind(me));
        me.attachEvent(me.#input, 'keydown', me.#onKeyDown.bind(me));
        me.attachEvent(me.#input, 'input', me.#onInput.bind(me));
    }

    #onInput(e) {
        if (!e.inputType) this.#updateTag(e);
    }

    #onSelect(e) {
        this.#updateTag(e);
    }

    #onKeyDown(e) {
        if (GSTag.#KEYS.includes(e.code)) this.#updateTag(e);
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
        const me = this;
        const el = me.allowAdd ? this.#datalist: this.#select;
        return Array.from(el.children);
    }

    get #selected() {
        const me = this;
        return me.#options.filter(el => el.value.toLowerCase() === me.#element.value.toLowerCase()).pop();        
    }

    get #isDuplicate() {
        const me = this;
        const val = me.#element.value.toLowerCase();
        return me.values.filter( v => v.toLowerCase() === val).length > 0 ;
    }

    #addTag(optEl) {
        const me = this;
        if (me.allowAdd) {
            me.#addEditable(optEl)
         } else me.#addSelectable(optEl);
    }


    #addSelectable(optEl) {
        const me = this;
        const fld = me.#select;
        if (me.#isMax) return;
        if (me.#isDuplicate) return;
        const src = me.#renderTag(fld.value);
        const el = GSDOM.parse(src, true);
        if (el) fld.insertAdjacentElement('beforebegin', el);
        fld.value = '';
        me.values = me.value;
    }

    #addEditable(optEl) {
        const me = this;
        const fld = me.#input;
        if (me.#isMax ||(!optEl && me.allowAdd == false)) {
            fld.value = '';
            return;
        }
        if (me.#isDuplicate) return;
        const src = me.#renderTag(fld.value);
        const el = GSDOM.parse(src, true);
        if (el) fld.insertAdjacentElement('beforebegin', el);
        fld.value = '';
        optEl?.remove();
        me.values = me.value;
    }
    
    #removeTag(tagEl) {
        if (!tagEl) return;
        const me = this;
        if (!me.allowAdd) {
            tagEl.remove();
            me.values = me.value;
            return;
        } 
        const opt  = document.createElement('option');
        opt.value = tagEl.dataset.value;
        me.#datalist.appendChild(opt);
        tagEl.remove();
        me.values = me.value;
    }

    #renderList() {
        const me = this;
        const items = GSItem.genericItems(me);        
        return items.map(el => me.#renderOption( el.name, me.allowAdd)).join('');
    }

    #renderOption(value, editable) {
        return editable ? `<option value="${value}">` : `<option value="${value}">${value}</option>`;
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
  
    get value() {
        return this.#data.join(',');
    }

    get #element() {
        const me = this;
        return me.allowAdd ? me.#input : me.#select;
    }

    get #input() {
        return this.query('input');
    }

    get #datalist() {
        return this.query('datalist');
    }

    get #select() {
        return this.query('select');
    }

    get name() {
        return GSAttr.get(this, 'name', '');
    }

    get allowAdd() {
        return this.hasAttribute('allowadd');
    }

    set allowAdd(val = false) {
        return GSAttr.toggle(this, 'allowadd', GSUtil.asBool(val));
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