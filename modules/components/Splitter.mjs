/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSSplitterElement class
 * @module components/GSSplitterElement
 */

import { classMap, createRef, ref, html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSCSSMap } from '../base/GSCSSMap.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { notEmpty, numGT0, placement } from '../properties/index.mjs';
import { ElementMoveController } from '../controllers/ElementMoveController.mjs';

/**
 * Renderer for element splitter
 * @class
 * @extends {Component}
 */
export class GSSplitterElement extends GSElement {

    static properties = {
        // Check if splitter use vertical or horizontal splitting
        split: { reflect: true },
        // start|end|top|bottom
        resize: { ...placement, hasChanged: notEmpty },
        size: { type: Number, hasChanged: numGT0 }
    }

    #cursor = 0;
    #styleID = GSID.id;
    #styleTGT = GSID.id;
    #elRef = createRef();
    #mouseController;

    constructor() {
        super();
        const me = this;
        me.size = 8;
        me.resize = 'start';
        me.dynamicStyle(me.#styleID);
        me.#load();
        me.#mouseController = new ElementMoveController(me);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        //this.dynamicStyle(this.#styleTGT, null, true);
    }

    firstUpdated(changed) {
        super.firstUpdated(changed);
        const me = this;
        me.#mouseController.attach(me.#splitter);
        //const shadow = GSDOM.root(me.target) instanceof ShadowRoot;
        //me.dynamicStyle(me.#styleTGT, {}, !shadow);
    }

    renderUI() {
        const me = this;
        return html`<div ${ref(me.#elRef)} 
            @dblclick="${me.#onDoubleClick}"
            data-gs-class="${me.#styleID}" 
            class="${classMap(me.renderClass())}">
            <slot></slot>
        </div>`;
    }

    renderClass() {
        const me = this;
        const css = {
            ...super.renderClass(),
            'splitter': true,
            [me.#styleID]: true
        }
        return css;
    }

    updated(changedProperties) {
        const me = this;
        me.#cssUpdate();
    }

    /**
    * Lock UI for mouse events to enable resizing over embedded iframes
    * @param {MouseEvent} e 
    */
    onStartMove(e) {
        const me = this;
        me.#cursor = me.isVertical ? e.clientX : e.clientY;
        me.#lock(true);
        GSEvents.send(globalThis, 'gs-split', { start: true });
    }

    /**
     * Handles resizing based on mouse move event
     * @param {MouseEvent} e 
     */
    onMouseMove(e) {
        const me = this;
        const pos = me.isVertical ? e.clientX : e.clientY;
        me.#updateMouse(pos);
    }

    /**
     * Save last position and unlock mouse UI events when resizing finished
     * @param {*} e 
     */
    onEndMove(e) {
        const me = this;
        me.#save();
        me.#lock(false);
        GSEvents.send(globalThis, 'gs-split', { stop: true });
    }

    /**
    * Check if splitter use vertical or hotizontal splitting
    * @returns {Boolean}
    */
    get isVertical() {
        return this.split === 'vertical';
    }

    get isHorizontal() {
        return !this.isVertical;
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
            el = Array.from(el.children).filter(o => !GSDOM.isStyleValue(o, 'display', 'none')).pop();
        }
        el.classList?.add(me.#styleTGT);
        return el;
    }

    get #isPreceeding() {
        const me = this;
        const resize = me.resize;
        return resize === 'start' || resize === 'top';
    }

    get #splitter() {
        return this.#elRef.value;
    }

    get #styleDynamic() {
        return this.target.style;
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

    #load() {
        const me = this;
        if (!me.id) return;
        const key = GSID.hashCode(location.origin + location.pathname);
        let val = localStorage.getItem(`gs-splitter-${key}-${me.id}`);
        val = GSUtil.asNum(val);
        me.#update(val);
    }

    #save() {
        const me = this;
        if (!me.id) return;
        const css = GSCSSMap.getComputedStyledMap(me.target);
        const val = me.isVertical ? css.get('width') : css.get('height');
        if (!val) return;
        const key = GSID.hashCode(location.origin + location.pathname);
        localStorage.setItem(`gs-splitter-${key}-${me.id}`, val);
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
     * Lock IFRAME,EMBED,PORTAL elements for mouse move events
     * @param {*} lock 
     */
    #lock(lock = true) {
        const me = this;
        const cls = 'pe-none';
        if (lock) {
            me.#lockable
                .filter(el => !GSDOM.hasClass(el, 'pe-none'))
                .forEach(el => {
                    GSDOM.toggleClass(el, cls, true);
                    el.dataset.gsSplitter = true;
                });
        } else {
            me.#lockable
                .filter(el => el.dataset.gsSplitter)
                .forEach(el => {
                    GSDOM.toggleClass(el, cls, false);
                    delete el.dataset.gsSplitter;
                });
        }
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
     * @param {Number} pos 
     */
    #updateX(pos) {
        const me = this;
        const target = me.target;
        const dir = me.#isPreceeding ? 1 : -1;
        let dx = (pos - me.#cursor) * dir;
        dx = dx + target.clientWidth;
        dx = dx < 0 ? 0 : dx;
        me.#styleDynamic.width = dx + "px";
        //me.dynamicStyle(me.#styleTGT, { width: dx + "px" }, true);
        me.#cursor = pos;
    }

    /**
     * Calculate height based on mouse position
     * @param {Number} pos 
     */
    #updateY(pos) {
        const me = this;
        const target = me.target;
        const dir = me.#isPreceeding ? 1 : -1;
        let dx = (pos - me.#cursor) * dir;
        dx = dx + target.clientHeight;
        dx = dx < 0 ? 0 : dx;
        me.#styleDynamic.height = dx + "px";
        //me.dynamicStyle(me.#styleTGT, { height: dx + "px" }, true);
        me.#cursor = pos;
    }

    #update(val = 0) {
        if (val <= 0) return
        const me = this;
        me.#cursor = val;
        const key = me.isVertical ? 'width' : 'height';
        me.#styleDynamic[key] = val + "px";
        //me.dynamicStyle(me.#styleTGT, { [key]: val + "px" }, true);
    }

    #cssUpdate() {
        const me = this;
        const size = me.isVertical ? 'width' : 'height';
        const full = me.isVertical ? 'height' : 'width';
        const cursor = me.isVertical ? 'w-resize' : 'n-resize';
        const opt = {
            [size]: `${me.size}px`,
            [full]: '100%',
            'border-width': '1px',
            cursor: cursor,
            'border-color': 'darkgray',
            'border-style': 'solid',
            'background-color': 'lightgray',
        };
        me.dynamicStyle(me.#styleID, opt);
    }

    static {
        this.define('gs-splitter');
    }
}

