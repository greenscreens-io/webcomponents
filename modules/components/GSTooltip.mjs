/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTooltip class
 * @module components/GSTooltip
 */

import GSID from "../base/GSID.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSDOMObserver from '../base/GSDOMObserver.mjs';
import GSListeners from "../base/GSListeners.mjs";
import GSElement from "../base/GSElement.mjs";

/**
 * Process Bootstrap tooltip efinition
 * <gs-tooltip placement="top" ref="#el_id" title="xxxxxx"></gs-tooltip>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSTooltip extends GSElement {

    static {
        customElements.define('gs-tooltip', GSTooltip);
        GSDOMObserver.registerFilter(GSTooltip.#onMonitorFilter, GSTooltip.#onMonitorResult);
    }

    /**
     * Filter function for monitor observer
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #onMonitorFilter(el) {
        if (!(el instanceof HTMLElement)) return false;
        if (el.tagName && el.tagName.startsWith('GS-')) return false;
        return GSTooltip.#isTooltip(el) && !GSTooltip.#hasTooltip(el);
    }

    /**
     * Function to attach gstooltip to the element
     * @param {HTMLElement} el 
     */
    static #onMonitorResult(el) {
        el.id = el.id || GSID.id;
        const tooltip = document.createElement('gs-tooltip');
        tooltip.ref = `#${el.id}`;
        requestAnimationFrame(() => {
            setTimeout(() => {
                el.parentElement.insertAdjacentElement('beforeend', tooltip);
            }, 100);
        });
    }

    constructor() {
        super();
    }

    onReady() {
        const me = this;
        super.onReady();
        me.#attachEvents();
    }

    // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
    #attachEvents() {
        const me = this;
        GSListeners.attachEvent(me, me.target, 'mouseover', me.show.bind(me));
        GSListeners.attachEvent(me, me.target, 'mouseout', me.hide.bind(me));
    }

    #render() {
        const me = this;
        const arrowEl = me.querySelector('div.tooltip-arrow');
        GSUtil.position(me.placement, me.firstElementChild, me.target, arrowEl);
        return me.firstElementChild;
    }

    get #html() {
        const me = this;
        return `
         <div class="tooltip bs-tooltip-${me.placement} fade " role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner">${me.title}</div>
        </div>        
        `;
    }

    get target() {
        const me = this;
        if (me.ref) {
            let owner = me.owner;
            owner = GSUtil.isGSElement(me.owner) ? owner.self : owner;
            return owner.querySelector(me.ref);
        }
        return me.previousElementSibling || me.parentElement;
    }

    get ref() {
        const me = this;
        return GSUtil.getAttribute(me, 'ref');
    }

    set ref(val = '') {
        return GSUtil.setAttribute(this, 'ref', val);
    }

    get title() {
        const me = this;
        return GSUtil.getAttribute(me, 'title') || GSUtil.getAttribute(me.target, 'title');
    }

    set title(val = '') {
        const me = this;
        return GSUtil.setAttribute(me, 'title', val);
    }

    get placement() {
        const me = this;
        return GSUtil.getAttribute(me, 'placement') || GSUtil.getAttribute(me.target, 'data-bs-placement', 'top');
    }

    set placement(val = '') {
        return GSUtil.setAttribute(this, 'placement', val);
    }

    get isFlat() {
        return true;
    }

    get position() {
        return 'self';
    }

    /**
     * Show tooltip
     */
    show() {
        const me = this;
        const el = GSUtil.parse(me.#html);
        me.insertAdjacentElement('afterbegin', el);
        requestAnimationFrame(() => {
            me.#render();
            GSUtil.toggleClass(this.firstElementChild, true, 'show');
        });
    }

    /**
     * Hide tooltip
     */
    hide() {
        const me = this;
        setTimeout(() => {
            me.innerHTML = '';
        }, 250);
        return GSUtil.toggleClass(this.firstElementChild, false, 'show');
    }

    /**
     * Toggle tooltip on/off
     */
    toggle() {
        const me = this;
        me.innerHTML ? me.hide() : me.show();
    }

    /**
     * Check if element has attached tooltip
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #hasTooltip(el) {
        return el && (el.firstElementChild instanceof GSTooltip || el.nextElementSibling instanceof GSTooltip);
    }

    /**
     * Check if standard element is tooltip defined
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #isTooltip(el) {
        return el instanceof HTMLElement && el.hasAttribute('title') && GSUtil.getAttribute(el, 'data-bs-toggle') === 'tooltip';
    }

}