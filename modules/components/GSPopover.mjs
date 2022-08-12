/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSPopover class
 * @module components/GSPopover
 */

import GSID from "../base/GSID.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSDOMObserver from '../base/GSDOMObserver.mjs';
import GSListeners from "../base/GSListeners.mjs";
import GSElement from "../base/GSElement.mjs";

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

    #unfocus = false;

    static {
        customElements.define('gs-popover', GSPopover);
        GSDOMObserver.registerFilter(GSPopover.#onMonitorFilter,  GSPopover.#onMonitorResult);
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
    static #onMonitorResult(el) {
        el.id = el.id || GSID.id;
        const popover = document.createElement('gs-popover'); 
        popover.ref = `#${el.id}`;
        requestAnimationFrame(()=>{
            setTimeout(()=>{
                el.parentElement.insertAdjacentElement('beforeend', popover);
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
        if ( me.isHoverTrigger) {
            GSListeners.attachEvent(me, me.target, 'mouseover', me.show.bind(me));
            GSListeners.attachEvent(me, me.target, 'mouseout', me.hide.bind(me));
        }
        if ( me.isFocusTrigger) {
            GSListeners.attachEvent(me, document.body, 'click', me.#focus.bind(me));
        }
    }
    
    #render() {
        const me = this;
        const source = me.firstElementChild;
        const arrowEl = me.querySelector('div.popover-arrow');
        GSUtil.position(me.placement, source, me.target, arrowEl);
        return source;
    }

    get #html() {
        const me = this;
        const head = me.title ? `<h3 class="popover-header">${me.title}</h3>` : '';
        return `
        <div class="popover bs-popover-${me.placement} fade" role="tooltip">
            <div class="popover-arrow"></div>
            ${head}
            <div class="popover-body">${me.content}</div>
        </div>            
        `;
    }
    
    get position() {
        return 'self';
    }

    get target() {
        const me = this;
        if(me.ref) {
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

    set title(val='') {
        const me = this;
        return GSUtil.setAttribute(me, 'title', val);
    }

    get placement() {
        const me = this;
        return GSUtil.getAttribute(me, 'placement') || GSUtil.getAttribute(me.target, 'data-bs-placement', 'top');
    }

    set placement(val='') {
        return GSUtil.setAttribute(this, 'placement', val);
    }

    get content() {
        const me = this;
        return GSUtil.getAttribute(me, 'content') || GSUtil.getAttribute(me.target, 'data-bs-content', '');
    }

    set content(val='') {
        return GSUtil.setAttribute(this, 'content', val);
    }

    get trigger() {
        const me = this;
        return GSUtil.getAttribute(me, 'trigger') || GSUtil.getAttribute(me.target, 'data-bs-trigger', 'hover focus');
    }

    set trigger(val='') {
        return GSUtil.setAttribute(this, 'trigger', val);
    }

    get isFocusTrigger() {
        return this.trigger.indexOf('focus') > -1;
    }

    get isHoverTrigger() {
        return this.trigger.indexOf('hover') > -1;
    }

    get visible() {
        return this.innerHTML.length !== 0;
    }

    get isFlat() {
        return true;
    }
    
    get position() {
        return 'self';
    }

    async getTemplate(def = '') {
        return '';
    }

    /**
     * Show popover     
     */
    show() {
        const me = this;
        const el = GSUtil.parse(me.#html);
        me.insertAdjacentElement('afterbegin', el);
        requestAnimationFrame(()=>{
            me.#render();
            GSUtil.toggleClass(this.firstElementChild, true, 'show');
        });
    }

    /**
     * Hide popover
     * @returns {boolean}
     */
    hide() {
        const me = this;
        if (me.#unfocus) return false;
        setTimeout(()=>{
            me.innerHTML = '';
        }, 250);
        return GSUtil.toggleClass(this.firstElementChild, false, 'show');
    }

    /**
     * Toggle popover on/off
     */
    toggle() {
        const me = this;
        me.visible ? me.hide() : me.show();
    }

    #focus(e) {
        const me = this;
        if (me.#unfocus) {
            me.#unfocus = false;
            me.hide();
            return;
        }
        const openable = !me.isHoverTrigger;
        if (e.target == me.target) {
            if(me.visible) {
                me.#unfocus = true;                
            }  else if (openable) {
                me.show();
            }
        } else if (openable && me.visible) me.hide();
    }

    /**
     * Check if element has attached tooltip
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static #hasPopover(el) {
        return el && (el.firstElementChild instanceof GSPopover || el.nextElementSibling instanceof GSPopover);
    }
    
    /**
     * Check if standard element is tooltip defined
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #isPopover(el) {
        return el instanceof HTMLElement && el.hasAttribute('data-bs-content') && GSUtil.getAttribute(el, 'data-bs-toggle') === 'popover';
    }

}
