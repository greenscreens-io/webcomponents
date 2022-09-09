/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTooltip class
 * @module components/GSTooltip
 */

import GSID from "../base/GSID.mjs";
import GSDOMObserver from '../base/GSDOMObserver.mjs';
import GSElement from "../base/GSElement.mjs";
import GSPopper from "../base/GSPopper.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";

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
        Object.seal(GSTooltip);
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
        me.attachEvent(me.target, 'mouseenter', me.show.bind(me));
        me.attachEvent(me.target, 'mouseleave', me.hide.bind(me));
    }

    #popup() {
        const me = this;
        const arrowEl = me.querySelector('div.tooltip-arrow');
        GSPopper.popupFixed(me.placement, me.firstElementChild, me.target, arrowEl);
        return me.firstElementChild;
    }

    get #html() {
        const me = this;
        return `
         <div class="tooltip bs-tooltip-auto fade " data-popper-placement="${me.placement}" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner">${me.title}</div>
        </div>        
        `;
    }

    get target() {
        const me = this;
        if (me.ref) {
            let owner = me.owner;
            owner = GSDOM.isGSElement(me.owner) ? owner.self : owner;
            return owner.querySelector(me.ref);
        }
        return me.previousElementSibling || me.parentElement;
    }

    get ref() {
        const me = this;
        return GSAttr.get(me, 'ref');
    }

    set ref(val = '') {
        return GSAttr.set(this, 'ref', val);
    }

    get title() {
        const me = this;
        return GSAttr.get(me, 'title') || GSAttr.get(me.target, 'title');
    }

    set title(val = '') {
        const me = this;
        return GSAttr.set(me, 'title', val);
    }

    get placement() {
        const me = this;
        return GSAttr.get(me, 'placement', me.target?.dataset?.bsPlacement || 'top');
    }

    set placement(val = '') {
        return GSAttr.set(this, 'placement', val);
    }

    get isFlat() {
        return true;
    }

    /**
     * Show tooltip
     */
    show() {
        const me = this;
        requestAnimationFrame(() => {
            const el = GSDOM.parse(me.#html, true);
            me.insertAdjacentElement('afterbegin', el);
            me.#popup();
            GSDOM.toggleClass(this.firstElementChild, true, 'show');
        });
    }

    /**
     * Hide tooltip
     */
    hide() {
        const me = this;
        setTimeout(() => {
           // GSDOM.setHTML(me, '');
           me.firstChild.remove();
        }, 250);
        return GSDOM.toggleClass(this.firstElementChild, false, 'show');
    }

    /**
     * Toggle tooltip on/off
     */
    toggle() {
        const me = this;
        me.childElementCount > 0 ? me.hide() : me.show();
    }

    /**
     * Check if element has attached tooltip
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #hasTooltip(el) {
        return (el?.firstElementChild || el?.nextElementSibling) instanceof GSTooltip;
    }

    /**
     * Check if standard element is tooltip defined
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #isTooltip(el) {
        return el?.title && el?.dataset?.bsToggle === 'tooltip';
    }

}

