/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSTag class
 * @module components/GSTag
 */

import { createRef, ref, classMap, css, html, ifDefined } from '../lib.mjs';
import { stringArrayConverter, color } from '../properties/index.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSAttr } from '../base/GSAttr.mjs';

/**
 * Tag list element
 * 
 * @class
 * @extends {GSTagElement}
 */
export default class GSTagElement extends GSElement {

    static #KEYS = ['Enter', ','];

    static styles = css`
        .tag-input:focus-visible {
            outline:none;
        }
        .tag .btn-close {
            background: none;
        }            
        .tag .btn-close::after {
            content: 'x';
        }`;

    static properties = {
        placeholder: {},
        max: { type: Number },
        size: { type: Number },
        name: {},
        data: { type: Array },
        values: { type: Array, reflect: true, converter: stringArrayConverter },
        appendable: { type: Boolean },
        color: { ...color },
        closeColor: { ...color, attribute: 'close-color' },
        cssClose: { attribute: 'css-close' },
        cssTag: { attribute: 'css-tag' },
    }

    // GS-ITEM attributes mapping
    static options = {
        name: {}
    }

    #dataListRef = createRef();
    #inputRef = createRef();

    constructor() {
        super();
        this.name = '';
        this.data = [];
        this.values = [];
        this.closeColor = 'light';
        this.color = 'primary';
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        if (!this.data.length) {
            const items = this.#items;
            if (items.length) this.data = items;
        }
    }

    renderUI() {
        const me = this;
        const tags = me.#renderTags();
        return html`
        <div  dir="${ifDefined(me.direction)}" 
            class="${classMap(me.renderClass())}"
            @click="${me.#onClick.bind(me)}">
            ${tags}
            <input type="text" 
            @keydown="${me.#onKeyDown.bind(me)}"
            ${ref(me.#inputRef)}
            name="${me.name}" 
            list="${me.name}_list"
            class="form-control d-flex w-auto flex-grow-1" 
            placeholder="${me.#info}">
            <datalist ${ref(me.#dataListRef)} id="${me.name}_list">${me.#renderList()}</datalist>
        </div>`;
    }

    renderClass() {
        const me = this;
        const css = {
            ...super.renderClass(),
            "d-flex": true,
            "flex-wrap": true,
            "align-items-center": true,
            "gap-1 ": true,
        }
        return css;
    }

    get #info() {
        const me = this;
        const alt = me.max > 0 ? `Add max ${me.max} tags...` : '';
        return me.placeholder ? me.placeholder : alt;
    }

    #onKeyDown(e) {
        if (GSTagElement.#KEYS.includes(e.key) || e.code === 'Comma') this.#updateTag(e);
    }

    #onClick(e) {
        const button = e.target?.closest?.('button.btn-close');
        if (button) this.#removeTag(button.parentElement);
    }

    #updateTag(e) {
        GSEvents.prevent(e);
        const me = this;
        me.#addTag(me.#selected);
    }

    get #isMax() {
        const me = this;
        return me.max > 0 && me.values.length >= me.max;
    }

    get #options() {
        return Array.from(this.#datalist.children);
    }

    get #selected() {
        const me = this;
        return me.#options.filter(el => el.value.toLowerCase() === me.#input.value.toLowerCase()).pop();
    }

    #addTag(optEl) {
        const me = this;
        const fld = me.#input;
        const value = fld.value.trim();
        if (!value) {
            fld.value = '';
            return;
        }
        if (me.#isMax) return;
        if (!optEl && !me.appendable) {
            fld.value = '';
            return;
        }
        if (!me.values.some(item => item.toLowerCase() === value.toLowerCase())) {
            me.values = [...me.values, value];
        }
        fld.value = '';
    }

    #removeTag(tagEl) {
        if (!tagEl) return;
        const me = this;
        const value = tagEl.dataset.value;
        me.values = me.values.filter(v => v !== value);
    }

    #renderTags() {
        const me = this;
        return me.values.map(v => me.#renderTag(v));
    }

    #renderTag(val = '') {
        if (!val) return '';
        const me = this;
        return html`<div class="${classMap(me.#tagClass)}" data-value="${val}">${val}<button type="button" class="${classMap(me.#btnClass)}" aria-label="Remove ${val}"></button></div>`;
    }

    get #tagClass() {
        const me = this;
        const opt = {
            badge: true,
            tag: true,
            [`fs-${me.size}`]: me.size > 0,
            [`text-bg-${me.color}`]: me.color ? true : false
        }
        return me.mapCSS(me.cssTag, opt);
    }

    get #btnClass() {
        const me = this;
        const opt = {
            'btn-close': true,
            'ms-1': true,
            [`text-bg-${me.closeColor}`]: me.closeColor ? true : false
        }
        return me.mapCSS(me.cssClose, opt);
    }

    #renderList() {
        const me = this;
        return me.data.map(v => html`<option value="${v}">`);
    }

    /**
     * Proxify GS-ITEM elements to easily read attributes
     */
    #proxify(root) {
        return GSItem.collect(root).map(el => GSAttr.proxify(el));
    }

    get #items() {
        return this.#proxify(this).map(el => el.name).filter(v => v ? true : false);
    }

    get #input() {
        return this.#inputRef.value;
    }

    get #datalist() {
        return this.#dataListRef.value;
    }

    static {
        this.define('gs-tag');
    }

}