/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSSplitter class
 * @module components/GSSplitter
 */

import GSID from "../base/GSID.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSEvent from "../base/GSEvent.mjs";

/**
 * Renderer for element splitter
 * @class
 * @extends {GSElement}
 */
export default class GSSplitter extends GSElement {

    #cursor = 0;
    #autostore = false;

    static {
        customElements.define('gs-splitter', GSSplitter);
        Object.seal(GSSplitter);
    }

    constructor() {
        super();
    }

    async getTemplate(val = '') {
        const me = this;
        const size = me.isVertical ? 'width' : 'height';
        const full = me.isVertical ? 'height' : 'width';
        const cursor = me.isVertical ? 'w-resize' : 'n-resize';
        return `
            <style>
                .splitter {
                    ${size}: ${me.size}px;
                    ${full}: 100%;
                    border-width: 1px;
                    cursor: ${cursor};
                    border-color: darkgray;
                    border-style: solid;
                    background-color: lightgray;
                }                        
            </style>
            <div class="splitter ${me.css}" style="${this.getStyle()}"></div>
        `;
    }

    /**
     * Check if splitter use vertical or hotizontal splitting
     * @returns {boolean}
     */
    get isVertical() {
        return GSUtil.getAttribute(this, 'split', 'vertical') === 'vertical';
    }

    get css() {
        return GSUtil.getAttribute(this, 'css');
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css', val);
    }

    /**
     * Width or height of a splitter in px
     * @returns {number}
     */
    get size() {
        return GSUtil.getAttributeAsNum(this, 'size', 8);
    }

    set size(val = '') {
        return GSUtil.setAttributeAsNum(this, 'size', val);
    }

    /**
     * Element selection for resizing
     * @returns {string} start|end|top|bottom
     */
    get resize() {
        return GSUtil.getAttribute(this, 'resize', 'start');
    }

    set resize(val = '') {
        return GSUtil.setAttribute(this, 'resize', val);
    }

    /**
     * Return preceding element
     * @returns {HTMLElement}
     */
    get start() {
        return this.previousElementSibling;
    }

    /**
    * Return following element
    * @returns {HTMLElement}
    */
    get end() {
        return this.nextElementSibling;
    }

    /**
     * Return closest element found
     * @returns {HTMLElement}
     */
    get target() {
        const me = this;
        let el = me.#isPreceeding ? me.start : me.end;
        el = el || me.parentElement;
        el = GSUtil.isGSElement(el) ? el.self : el;
        if (el instanceof ShadowRoot) {
            el = Array.from(el.children).filter(o => window.getComputedStyle(o).display !== 'none').pop();
        }
        return el;
    }

    connectedCallback() {
        const me = this;
        me.#autostore = me.id ? true : false;
        super.connectedCallback();
    }

    onReady() {
        const me = this;
        me.#load();
        me.#listen();
        super.onReady();
    }

    get #isPreceeding() {
        const me = this;
        const resize = me.resize;
        return resize === 'start' || resize === 'top';
    }

    get #splitter() {
        return this.findEl('div');
    }

    #load() {
        const me = this;
        if (!me.#autostore) return;
        const key = GSID.hashCode(location.origin + location.pathname);
        let val = localStorage.getItem(`gs-splitter-${key}-${me.id}`);
        val = GSUtil.asNum(val);
        if (val > 0) {
            me.#cursor = val;
            if (me.isVertical) {
                me.target.style.width = val + "px";
            } else {
                me.target.style.height = val + "px";
            }
        }
    }

    #save() {
        const me = this;
        const style = window.getComputedStyle(me.target);
        const val = me.isVertical ? style.width : style.height;
        const key = GSID.hashCode(location.origin + location.pathname);
        localStorage.setItem(`gs-splitter-${key}-${me.id}`, val.match(/(\d+)/)[0]);
    }

    /**
     * Initial event listener setup.
     * Other events attaches as needed (on click)
     */
    #listen() {
        const me = this;
        const el = me.#splitter;
        me.attachEvent(el, 'mousedown', me.#onMouseDown.bind(me), true);
    }

    /**
    * Starts secondary listeners for mouse move for resizing and mouseup for stopping
    * @param {MouseEvent} e 
    */
    #onMouseDown(e) {
        const me = this;
        GSEvent.prevent(e);
        me.#cursor = me.isVertical ? e.clientX : e.clientY;
        me.attachEvent(document, 'mouseup', me.#onMouseUp.bind(me), true);
        me.attachEvent(document, 'mousemove', me.#onMouseMove.bind(me));
    }

    /**
     * Removes all secondary listeners, and reattach initial listening state
     * @param {MouseEvent} e 
     */
    #onMouseUp(e) {
        const me = this;
        GSEvent.prevent(e);
        GSEvent.deattachListeners(me);
        me.#save();
        me.#listen();
    }


    /**
     * Handles resizing based on mouse move event
     * @param {MouseEvent} e 
     */
    #onMouseMove(e) {
        const me = this;
        GSEvent.prevent(e);
        const pos = me.isVertical ? e.clientX : e.clientY;
        me.#update(pos);
    }

    #update(pos) {
        const me = this;
        requestAnimationFrame(() => {
            if (me.isVertical) {
                me.#updateX(pos);
            } else {
                me.#updateY(pos);
            }
        });
    }

    /**
     * Calculate width based on mouse position
     * @param {number} pos 
     */
    #updateX(pos) {
        const me = this;
        const target = me.target;
        const dir = me.#isPreceeding ? 1 : -1;
        let dx = (pos - me.#cursor) * dir;
        dx = dx + target.clientWidth;
        dx = dx < 0 ? 0 : dx;
        target.style.width = dx + "px";
        me.#cursor = pos;
    }

    /**
     * Calculate height based on mouse position
     * @param {number} pos 
     */
    #updateY(pos) {
        const me = this;
        const target = me.target;
        const dir = me.#isPreceeding ? 1 : -1;
        let dx = (pos - me.#cursor) * dir;
        dx = dx + target.clientHeight;
        dx = dx < 0 ? 0 : dx;
        target.style.height = dx + "px";
        me.#cursor = pos;
    }
}
