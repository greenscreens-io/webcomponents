/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSLayout class
 * @module components/GSLayout
 */

import GSItem from "../base/GSItem.mjs";
import GSElement from "../base/GSElement.mjs";
import GSID from "../base/GSID.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSCSSMap from "../base/GSCSSMap.mjs";

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
        GSItem.validate(this, this.tagName);
    }

    disconnectedCallback() {
        GSItem.genericItems(this).forEach(el  => GSCacheStyles.deleteRule(el.dataset.cssId));        
        super.disconnectedCallback();
    }

    async getTemplate(val = '') {
        const me = this;
        const list = GSItem.genericItems(me).map((el, idx) => me.#generateHtml(el, idx));
        const html = await Promise.all(list);
        const type = me.isVertical ? 'flex-column' : 'flex-row';
        const top = me.isFlat ? '' : 'vh-100';
        return `<div class="${top} d-flex flex-fill ${type} ${me.css}  ${me.styleID}"  data-css-id="${me.styleID}">${html.join('')}</div>`
    }

    /**
     * Determine if gs-layout is nested in another layout
     * If nested, rendering is flat.
     * @returns {boolean}
     */
    get isFlat() {
        const me = this;
        if (me.owner instanceof GSLayout) return true;

        const el = me.closest('gs-layout');
        if (el && el !== me) return true;

        const parent = GSComponents.getOwner(me); // me.parentElement
        const css = GSCSSMap.getComputedStyledMap(parent);
        return css.matches('display', 'flex') && !css.matches('flexGrow', '0');
    }

    get anchor() {
        return 'afterend@self';
    }

    /**
     * Generate html injection source for a gs-item
     * 
     * @async
     * @param {HTMLElement} el 
     * @param {Number} idx
     * @returns {Promise<string>}
     */
    async #generateHtml(el, idx) {
        const me = this;
        el.dataset.cssId = `${me.id}-${idx}`;
        const res = me.#resizable(el);

        const id = GSAttr.get(el, 'id');
        const name = GSAttr.get(el, 'name');
        const tpl = GSItem.getBody(el, me.isFlat);

        const style = me.#generateStyle(el);
        GSCacheStyles.setRule(el.dataset.cssId, style);
        
        const fixed = style.length > 10 ? true : false;
        const cls = me.#generateClass(el, fixed);

        const child = `<div class="${cls} ${el.dataset.cssId}" data-css-id="${el.dataset.cssId}" id="${name || GSID.id}">${tpl}</div>`;

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
    #generateStyle(el) {
        const me = this;
        const sfx = me.isVertical ? 'height' : 'width';
        const max = GSAttr.getAsNum(el, 'max', 0);
        const min = GSAttr.getAsNum(el, 'min', 0);
        const size = GSAttr.getAsNum(el, 'size', 0);
        /*
        const style = {};        
        style[`max-${sfx}`] = max > 0 ? `${max}px;` : '';
        style[`min-${sfx}`] = min > 0 ? `${min}px;` : '';
        return style;        
        */
        const ssize = size > 0 ? `${sfx}: ${size}}px;` : '';
        const smax = max > 0 ? `max-${sfx}: ${max}px;` : '';
        const smin = min > 0 ? `min-${sfx}: ${min}px;` : '';
        return [ssize, smax, smin].join('');
    }

    /**
    * Generate list of css classes for an gs-item
    * @param {HTMLElement} el 
    * @returns {string}
    */
    #generateClass(el, fixed = false) {
        const me = this;
        const res = me.#resizable(el);

        const css = GSAttr.get(el, 'css');
        let vpos = GSAttr.get(el, 'v-pos');
        let hpos = GSAttr.get(el, 'h-pos');

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
        return GSAttr.getAsBool(el, 'resizable', false);
    }

    /**
     * Check if layout is vertical or horizontal
     * @returns {boolean}
     */
    get isVertical() {
        return GSAttr.get(this, 'type', 'vertical') === 'vertical';
    }

    /**
     * Get user defined css for a layout panel
     * @returns {string}
     */
    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

}
