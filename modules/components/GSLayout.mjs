/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSLayout class
 * @module components/GSLayout
 */

import GSUtil from "../base/GSUtil.mjs";
import GSItem from "../base/GSItem.mjs";
import GSElement from "../base/GSElement.mjs";
import GSID from "../base/GSID.mjs";

/**
 * Renderer for panel layout 
 * @class
 * @extends {GSElement}
 */
export default class GSLayout extends GSElement {

    static {
        customElements.define('gs-layout', GSLayout);
        Object.seal(GSLayout);
    }

    constructor() {
        super();
    }

    async getTemplate(val = '') {
        const me = this;
        const list = GSItem.genericItems(me).map(el => me.#html(el));
        const html = await Promise.all(list);
        const type = me.isVertical ? 'flex-column' : 'flex-row';
        const top = me.isFlat ? '' : 'vh-100';
        return `<div class="${top} d-flex flex-fill ${type} ${me.css}">${html.join('')}</div>`
    }

    /**
     * Determin if gs-layout is nested in another layout
     * If nested, rendering is flat.
     * @returns {boolean}
     */
    get isFlat() {
        const me = this;
        if (me.owner instanceof GSLayout) return true;

        const el = me.closest('gs-layout');
        if (el && el != me) return true;

        const style = window.getComputedStyle(me.parentElement);
        return style.display === 'flex' && style.flexGrow !== '0';
    }

    get position() {
        return 'unwrap'
    }

    /**
     * Generate html injection source for an gs-item
     * @param {HTMLElement} el 
     * @returns {string}
     */
    async #html(el) {
        const me = this;
        const res = me.#resizable(el);

        const id = GSUtil.getAttribute(el, 'id');
        const name = GSUtil.getAttribute(el, 'name');
        const tpl = await GSItem.getTemplate(el);

        const style = me.#style(el);
        const fixed = style.length > 10 ? true : false;
        const cls = me.#class(el, fixed);

        const child = `<div class="${cls}" id="${name || GSID.next()}" ${style}>${tpl}</div>`;

        if (res) {
            const pos = me.#splitter(el);
            if (pos == 0) return child;
            let resize = '';
            if (pos > 0) {
                resize = me.isVertical ? 'top' : 'start';
            } else {
                resize = me.isVertical ? 'bottom' : 'end';
            }
            const split = `<gs-splitter resize="${resize}" split="${me.isVertical ? 'horizontal' : 'vertical'}" id="${id}"></gs-splitter>`;
            return pos == 1 ? [child, split].join('') : [split, child].join('');
        }

        return child;
    }

    /**
     * Generate min & max width / height for an gs-item
     * @param {HTMLElement} el 
     * @returns {string}
     */
    #style(el) {
        const me = this;
        const sfx = me.isVertical ? 'height' : 'width';
        const max = GSUtil.getAttributeAsNum(el, 'max', 0);
        const min = GSUtil.getAttributeAsNum(el, 'min', 0);
        const smax = max > 0 ? `max-${sfx}: ${max}px;` : '';
        const smin = min > 0 ? `min-${sfx}: ${min}px;` : '';
        return ['style="', smax, smin, '"'].join('');
    }

    /**
    * Generate list of css classes for an gs-item
    * @param {HTMLElement} el 
    * @returns {string}
    */
    #class(el, fixed = false) {
        const me = this;
        const res = me.#resizable(el);

        const css = GSUtil.getAttribute(el, 'css');
        let vpos = GSUtil.getAttribute(el, 'v-pos');
        let hpos = GSUtil.getAttribute(el, 'h-pos');

        hpos = hpos ? `justify-content-${hpos}` : '';
        vpos = vpos ? `align-items-${vpos}` : '';

        const cls = ['d-flex', hpos, vpos];
        if (res == false && fixed == false) cls.push('flex-fill');

        cls.push(css);

        return cls.join(' ');
    }

    /**
     * Detect splitter target (previous | next | not supported)
     * @param {HTMLElement} el 
     * @returns {number} -1|0|1
     */
    #splitter(el) {
        const me = this;
        const start = el.previousElementSibling;
        const end = el.nextElementSibling;
        if (!end && !start) return 0;
        if (!end) return -1;
        if (!start) return 1;

        if (!me.#resizable(end)) return 1;
        if (!me.#resizable(start)) return -1;

        return 0;
    }

    /**
     * Check if gs-item element has gs-splitter
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    #resizable(el) {
        return GSUtil.getAttributeAsBool(el, 'resizable', false);
    }

    /**
     * Check if layout is vertical or horizontal
     * @returns {boolean}
     */
    get isVertical() {
        return GSUtil.getAttribute(this, 'type', 'vertical') === 'vertical';
    }

    /**
     * Get user defined css for a layout panel
     * @returns {string}
     */
    get css() {
        return GSUtil.getAttribute(this, 'css');
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css', val);
    }

}
