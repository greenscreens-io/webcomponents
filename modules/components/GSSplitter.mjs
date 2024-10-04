/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSSplitter class
 * @module components/GSSplitter
 */

import GSID from "../base/GSID.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSCSSMap from "../base/GSCSSMap.mjs";
import GSElement from "../base/GSElement.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";

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

    disconnectedCallback(){
        GSCacheStyles.deleteRule(this.#ruleDynamic);
        super.disconnectedCallback();
    }

    get #ruleDynamic() {
        return `${this.styleID}-dynamic`;
    }

    get #cssDynamic() {
        const me = this;
        const size = me.isVertical ? 'width' : 'height';
        const full = me.isVertical ? 'height' : 'width';
        const cursor = me.isVertical ? 'w-resize' : 'n-resize';
        return `
            ${size}: ${me.size}px;
            ${full}: 100%;
            border-width: 1px;
            cursor: ${cursor};
            border-color: darkgray;
            border-style: solid;
            background-color: lightgray;
        `;
    }

    async getTemplate(val = '') {
        const me = this;
        GSCacheStyles.setRule(me.#ruleDynamic, me.#cssDynamic);
        return `<div class="splitter ${me.css} ${me.styleID} ${me.#ruleDynamic}" data-css-id="${this.styleID}" data-rule-id="${this.#ruleDynamic}"></div>`;
    }

    /**
     * Check if splitter use vertical or hotizontal splitting
     * @returns {boolean}
     */
    get isVertical() {
        return GSAttr.get(this, 'split', 'vertical') === 'vertical';
    }

    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    /**
     * Width or height of a splitter in px
     * @returns {number}
     */
    get size() {
        return GSAttr.getAsNum(this, 'size', 8);
    }

    set size(val = '') {
        return GSAttr.setAsNum(this, 'size', val);
    }

    /**
     * Element selection for resizing
     * @returns {string} start|end|top|bottom
     */
    get resize() {
        return GSAttr.get(this, 'resize', 'start');
    }

    set resize(val = '') {
        return GSAttr.set(this, 'resize', val);
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
        el = GSDOM.isGSElement(el) ? el.self : el;
        if (el instanceof ShadowRoot) {
            // no firefox support
            el = Array.from(el.children).filter(o => !GSDOM.isStyleValue(o, 'display' ,'none')).pop();
        }
        return el;
    }

    connectedCallback() {
        const me = this;
        me.#autostore = me.id ? true : false;
        super.connectedCallback();
    }

    async onBeforeReady() {
        await super.onBeforeReady();
        const me = this;
        me.#load();
        me.#listen();
    }

    get #isPreceeding() {
        const me = this;
        const resize = me.resize;
        return resize === 'start' || resize === 'top';
    }

    get #splitter() {
        return this.query('div');
    }

    #load() {
        const me = this;
        if (!me.#autostore) return;
        const key = GSID.hashCode(location.origin + location.pathname);
        let val = localStorage.getItem(`gs-splitter-${key}-${me.id}`);
        val = GSUtil.asNum(val);
        me.#update(val);
    }

    #save() {
        const me = this;
        const css = GSCSSMap.getComputedStyledMap(me.target);
        const val = me.isVertical ? css.get('width') : css.get('height');
        if (!val) return;
        const key = GSID.hashCode(location.origin + location.pathname);
        localStorage.setItem(`gs-splitter-${key}-${me.id}`, val);
    }

    /**
     * Initial event listener setup.
     * Other events attaches as needed (on click)
     */
    #listen() {
        const me = this;
        const el = me.#splitter;
        me.attachEvent(el, 'mousedown', me.#onMouseDown.bind(me), true);
        me.attachEvent(el, 'dblclick', me.#onDoubleClick.bind(me));
    }

    #onDoubleClick(e) {

        const me = this;
        let csize = 0;
        let key = '';

        if (me.isVertical) {
            key = 'width';
            csize = me.target.clientWidth;
        } else {
            key = 'height';
            csize = me.target.clientHeight;
        }
        
        let min = GSCSSMap.styleValue(me.target, `min-${key}`);
        let max = GSCSSMap.styleValue(me.target, `max-${key}`);

        min = GSUtil.asNum(min.value);
        max = GSUtil.asNum(max.value);

        if ((max - min) / 2 > csize) {
            csize = max;
        } else {
            csize = min;
        }
        me.#update(csize);

    }

    /**
    * Starts secondary listeners for mouse move for resizing and mouseup for stopping
    * @param {MouseEvent} e 
    */
    #onMouseDown(e) {
        const me = this;
        GSEvents.prevent(e);
        me.#cursor = me.isVertical ? e.clientX : e.clientY;
        me.attachEvent(document, 'mouseup', me.#onMouseUp.bind(me), true);
        me.attachEvent(document, 'mousemove', me.#onMouseMove.bind(me));
        me.#lock(true);
        GSEvents.send(globalThis, 'gs-split', {start: true});
    }

    /**
     * Removes all secondary listeners, and reattach initial listening state
     * @param {MouseEvent} e 
     */
    #onMouseUp(e) {
        const me = this;
        GSEvents.prevent(e);
        GSEvents.deattachListeners(me);
        me.#save();
        me.#listen();
        me.#lock(false);
        GSEvents.send(globalThis, 'gs-split', {stop: true});
    }

    /**
     * Handles resizing based on mouse move event
     * @param {MouseEvent} e 
     */
    #onMouseMove(e) {
        const me = this;
        GSEvents.prevent(e);
        const pos = me.isVertical ? e.clientX : e.clientY;
        me.#updateMouse(pos);
    }

    /**
     * Lock IFRAME,EMBED,PORTAL elements for mouse move events
     * @param {*} lock 
     */
    #lock(lock = true) {
        const me = this;
        const cls = 'pe-none';
        if (lock) {
            me.#lockable
            .filter(el => !GSDOM.hasClass(el, 'pe-none'))
            .forEach(el =>{
                GSDOM.toggleClass(el, cls, true);
                el.dataset.gsSplitter = true;
            });
        } else {
            me.#lockable
            .filter(el => el.dataset.gsSplitter)
            .forEach(el =>{
                GSDOM.toggleClass(el, cls, false);
                delete el.dataset.gsSplitter;
            });            
        }
    }

    /**
     * Get elements which must be protected to allow mouse move over 
     */
    get #lockable() {
        const me = this;
        const qry = 'iframe,embed,portal';
        const p = GSDOM.queryAll(me.previousElementSibling, qry);
        const n = GSDOM.queryAll(me.nextElementSibling, qry);
        return [...p, ...n];
    }
    
    #updateMouse(pos) {
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
        me.#styleDynamic.width = dx + "px";
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
        me.#styleDynamic.height = dx + "px";
        me.#cursor = pos;
    }

    #update(val = 0) {
        if (val <= 0) return
        const me = this;
        me.#cursor = val;
        if (me.isVertical) {
            me.#styleDynamic.width = val + "px";
        } else {
            me.#styleDynamic.height = val + "px";
        }
    }

    get #styleDynamic() {
        const me = this;
        const target = me.target;
        const rule = GSCacheStyles.getRule(target.dataset.cssId || target.id);
        return rule?.style || target.style;        
    }
}

