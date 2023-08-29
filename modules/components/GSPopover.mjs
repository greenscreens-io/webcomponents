/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSPopover class
 * @module components/GSPopover
 */

import GSID from "../base/GSID.mjs";
import GSDOMObserver from '../base/GSDOMObserver.mjs';
import GSEvents from "../base/GSEvents.mjs";
import GSElement from "../base/GSElement.mjs";
import GSPopper from "../base/GSPopper.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * https://getbootstrap.com/docs/5.1/components/popovers/
 * Process Bootstrap popover definition
 * <gs-popover ref="#el_id" placement="top" title="" content="" trigger="focus hover"></gs-popover>
 * 
 * TODO - only basic implementation is done, more work required
 * @class
 * @extends {GSElement}
 */
export default class GSPopover extends GSElement {

    static {
        customElements.define('gs-popover', GSPopover);
        Object.seal(GSPopover);
        GSDOMObserver.registerFilter(GSPopover.#onMonitorFilter, GSPopover.#onMonitorResult);
    }

    /**
     * Filter function for monitor observer
     * @param {HTMLElement} el 
     * @returns {void}
     */
    static #onMonitorFilter(el) {
        if (!(el instanceof HTMLElement)) return false;
        if (el.tagName && el.tagName.startsWith('GS-')) return false;
        return GSPopover.#isPopover(el) && !GSPopover.#hasPopover(el);
    }

    /**
     * Function to attach gs-popover to the element
     * @param {HTMLElement} el 
     */
    static async #onMonitorResult(el) {
        await GSUtil.timeout(1000);
        return GSEvents.waitAnimationFrame(async () => {
            GSID.setIf(el);
            const popover = document.createElement('gs-popover');
            popover.ref = `#${el.id}`;
            el.parentElement.insertAdjacentElement('beforeend', popover);
        }, true);
    }

    constructor() {
        super();
        this.innerHTML = this.innerHTML.trim();
    }

    disconnectedCallback() {
        const me = this;
        GSCacheStyles.deleteRule(me.#arrowID);
        super.disconnectedCallback();
    }

    async onBeforeReady() {
        await super.onBeforeReady();
        const me = this;
        me.#render(me.#contentel);
        me.#attachEvents();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        if (name === 'visible') {
            if (me.visible) me.#render(me.#contentel);
            GSDOM.toggleClass(me.#contentel, 'show', me.visible);
        }
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

    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get cssHead() {
        return GSAttr.get(this, 'css-head', 'fs-3');
    }

    set cssHead(val = '') {
        return GSAttr.set(this, 'css-head', val);
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

    get content() {
        const me = this;
        return GSAttr.get(me, 'content', me.target?.dataset?.bsContent || '');
    }

    set content(val = '') {
        return GSAttr.set(this, 'content', val);
    }

    get trigger() {
        const me = this;
        return GSAttr.get(me, 'trigger', me.target?.dataset?.bsTrigger || 'hover focus');
    }

    set trigger(val = '') {
        return GSAttr.set(this, 'trigger', val);
    }

    get isFocusTrigger() {
        return this.trigger.includes('focus');
    }

    get isHoverTrigger() {
        return this.trigger.includes('hover');
    }

    get visible() {
        return GSAttr.getAsBool(this, 'visible', false);
    }

    set visible(val = '') {
        return GSAttr.setAsBool(this, 'visible', val);
    }

    get isFlat() {
        //return true;
        return super.isFlat;
    }

    get anchor() {
        //return 'self';
        return super.anchor;
    }

    async getTemplate(def = '') {
        const tpl = await super.getTemplate(def);
        const me = this;
        const head = me.title ? `<div class="popover-header ${me.cssHead}">${me.title}</div>` : '';
        return `
        <div class="popover bs-popover-auto fade ${me.css} ${this.styleID}" data-popper-placement="${me.placement}" data-css-id="${this.styleID}" role="tooltip">
            <div class="popover-arrow ${me.#arrowID}" data-css-id="${me.#arrowID}"></div>
            ${head}
            <div class="popover-body">
                <slot>${tpl || me.content}</slot>
            </div>
        </div>            
        `;
    }

    /**
     * Show popover     
     */
    show(e) {
        GSEvents.prevent(e);
        this.visible = true;
    }

    /**
     * Hide popover
     * @returns {boolean}
     */
    hide(e) {
        GSEvents.prevent(e);
        this.visible = false;
    }

    /**
     * Toggle popover on/off
     */
    toggle(e) {
        GSEvents.prevent(e);
        const me = this;
        me.visible = !me.visible;
    }

    get #contentel() {
        return this.self.firstElementChild;
    }

    get #arrowID() {
        return `${this.styleID}-arrow`;
    }

    // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
    #attachEvents() {
        const me = this;
        if (me.isHoverTrigger) {
            GSEvents.attach(me, me.target, 'mouseover', me.show.bind(me));
            GSEvents.attach(me, me.target, 'mouseleave', me.hide.bind(me));
        }
        if (me.isFocusTrigger) {
            GSEvents.attach(me, me.target, 'click', me.toggle.bind(me));
            GSEvents.attach(me, me.#contentel, 'mouseleave', me.hide.bind(me));
            GSEvents.attach(me, document.body, 'click', me.hide.bind(me));
        }
    }

    #render(source) {
        const me = this;
        source = source || me.self.firstElementChild;
        const arrowEl = source.querySelector('div.popover-arrow');
        GSPopper.popupAbsolute(me.placement, source, me.target, arrowEl);
        return source;
    }

    /**
     * Check if element has attached tooltip
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static #hasPopover(el) {
        return (el?.firstElementChild || el?.nextElementSibling) instanceof GSPopover;
    }

    /**
     * Check if standard element is tooltip defined
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #isPopover(el) {
        return el?.dataset?.bsContent && el?.dataset?.bsToggle === 'popover';
    }

}

