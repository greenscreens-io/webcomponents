/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSPopup class
 * @module components/GSPopup
 */

import GSElement from "../base/GSElement.mjs";
import GSEvent from "../base/GSEvent.mjs";
import GSPopper from "../base/GSPopper.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Popup panel
 * NOTE: Must be rendered in body, as transform_translate(...) issues
 * @class
 * @extends {GSElement}
 */
export default class GSPopup extends GSElement {

    // element that opened context
    #caller = null;
    #online = false;
    #ready = false;
    #attached = false;

    static {
        customElements.define('gs-popup', GSPopup);
    }

    static get observedAttributes() {
        const attrs = ['visible', 'css'];
        return GSElement.observeAttributes(attrs);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        if (name === 'visible') {
            me.#resize();
            GSUtil.toggleClass(me.#panel, !me.visible, 'invisible');
        }
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.#online = true;
        me.attachEvent(me, 'form', me.#onForm.bind(me));
    }

    disconnectedCallback() {
        const me = this;
        me.#online = false;
        super.disconnectedCallback();
    }

    async getTemplate(val = '') {
        const me = this;
        const tpl = await super.getTemplate(val);
        const state = me.visible ? '' : 'invisible';
        return `<div class="position-${me.position} ${me.css} ${state}" style="${this.getStyle()}"><slot>${tpl}</slot></div>`;
    }

    onReady() {
        const me = this;
        if (me.#ready) return;
        me.#ready = true;
        me.#onReady();
        super.onReady();
    }

    get #panel() {
        return this.findEl('div');
    }

    get css() {
        return GSUtil.getAttribute(this, 'css');
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css', val);
    }

    /**
     * Event on target element used to trigger popup
     */
    get event() {
        return GSUtil.getAttribute(this, 'event', 'click');
    }

    set event(val = '') {
        return GSUtil.setAttribute(this, 'event', val);
    }

    /**
     * Where to place popup relative to target element, only if v-pos and h-pos not used
     */
    get placement() {
        const me = this;
        return GSUtil.getAttribute(me, 'placement') || GSUtil.getAttribute(me.target, 'data-bs-placement');
    }

    set placement(val = '') {
        return GSUtil.setAttribute(this, 'placement', val);
    }

    /**
     * CSS position value (absolute, fixed, relative ...)
     */
    get position() {
        const me = this;
        return GSUtil.getAttribute(me, 'position', 'absolute');
    }

    set position(val = '') {
        return GSUtil.setAttribute(this, 'position', val);
    }

    /**
     * Where to place popup relative to target element, only if v-pos and h-pos not used
     */
    get target() {
        const me = this;
        return GSUtil.getAttribute(me, 'target');
    }

    set target(val = '') {
        return GSUtil.setAttribute(this, 'target', val);
    }

    /**
     * Set popup visible or hiden
     */
    get visible() {
        return GSUtil.getAttributeAsBool(this, 'visible', false);
    }

    set visible(val = '') {
        return GSUtil.setAttributeAsBool(this, 'visible', val);
    }

    /**
     * Should auto close popup on mouse leave
     */
    get autoclose() {
        return GSUtil.getAttributeAsBool(this, 'autoclose', true);
    }

    set autoclose(val = '') {
        return GSUtil.setAttributeAsBool(this, 'autoclose', val);
    }

    /**
     * X-Axis popup position
     */
    get hPos() {
        return GSUtil.getAttributeAsNum(this, 'h-pos');
    }

    set hPos(val = '') {
        return GSUtil.setAttributeAsNum(this, 'h-pos', val);
    }

    /**
     * Y-Axis popup position
     */
    get vPos() {
        return GSUtil.getAttributeAsNum(this, 'v-pos');
    }

    set vPos(val = '') {
        return GSUtil.setAttributeAsNum(this, 'v-pos', val);
    }


    set wMax(val = '') {
        return GSUtil.setAttributeAsNum(this, 'w-max', val);
    }

    get wMax() {
        return GSUtil.getAttributeAsNum(this, 'w-max');
    }

    set wMin(val = '') {
        return GSUtil.setAttributeAsNum(this, 'w-min', val);
    }

    get wMin() {
        return GSUtil.getAttributeAsNum(this, 'w-min');
    }

    set hMax(val = '') {
        return GSUtil.setAttributeAsNum(this, 'h-max', val);
    }

    get hMax() {
        return GSUtil.getAttributeAsNum(this, 'h-max');
    }

    set hMin(val = '') {
        return GSUtil.setAttributeAsNum(this, 'h-min', val);
    }

    get hMin() {
        return GSUtil.getAttributeAsNum(this, 'h-min');
    }

    close(e) {
        const me = this;
        me.visible = false;
        if (e instanceof Event) {
            e.preventDefault();
            const opt = { type: 'popup', option: e.target, caller: me.#caller, data: null };
            GSEvent.send(me, 'action', opt, true, true);
        }
    }

    open() {
        this.visible = true;
    }

    toggle(e) {
        const me = this;
        if (e) return me.#onPopup(e);
        me.visible = !me.visible;
    }

    /**
     * Show popup at x/y position on the screen
     * @param {number} x 
     * @param {number} y 
     * @returns {void}
     */
    popup(x = 0, y = 0) {
        const me = this;
        const panel = me.#panel;
        if (!panel) return;
        requestAnimationFrame(() => {
            me.visible = true;
            panel.style.top = '0px';
            panel.style.left = '0px';
            me.#resize();
            panel.style.transform = `translate(${x}px, ${y}px)`;
        });

    }

    #resize() {
        const me = this;
        const panel = me.#panel;
        if (!panel) return;
        if (!me.visible) me.style.transform = 'unset';
        if (me.wMax) panel.style.maxWidth = `${me.wMax}px`;
        if (me.wMin) panel.style.minWidth = `${me.wMin}px`;
        if (me.hMax) panel.style.maxHeight = `${me.hMax}px`;
        if (me.hMin) panel.style.minHeight = `${me.hMin}px`;
    }

    #onResize(e) {
        this.close();
    }

    #onPopup(e) {
        const me = this;
        me.#caller = e;
        if (e instanceof Event) {
            e.preventDefault();
            me.#caller = e.path.filter(e => (!(e instanceof HTMLSlotElement)))[0];
        }

        if (me.placement) {
            GSPopper.popupFixed(me.placement, me.#panel, me.#caller);
            me.visible = true;
            return;
        }
        let x = e.clientX, y = e.clientY;
        const rect = me.#panel.getBoundingClientRect();
        const overflowH = x + rect.width > window.innerWidth;
        const overflowV = y + rect.height > window.innerHeight;
        if (overflowH) x = window.innerWidth - rect.width;
        if (overflowV) y = window.innerHeight - rect.height;
        me.popup(x, y);
        return true;
    }

    /**
     * Attach popup to target
     */
    async #attachTarget() {
        const me = this;
        if (!me.target) return;
        if (me.#attached) return;
        const targets = GSComponents.findTarget(me, me.target);
        if (targets.length === 0) {
            if (me.#online) {
                await GSUtil.timeout(1000);
                requestAnimationFrame(() => {
                    me.#attachTarget();
                })
            }
            return;
        }
        me.#attached = true;
        me.event.split(' ').forEach(e => {
            targets.forEach(target => me.attachEvent(target, e, me.#onPopup.bind(me)));
        });
        me.removeEvent(document, 'gs-components');
    }

    #onReady() {
        const me = this;
        me.#attachTarget();
        me.attachEvent(document, 'gs-component', me.#attachTarget.bind(me));
        me.attachEvent(window, 'resize', me.#onResize.bind(me));
        me.#resize();
        if (me.autoclose) me.attachEvent(me.#panel, 'mouseleave', me.close.bind(me));
        if (me.visible) me.popup(me.hPos, me.vPos);
    }

    #onForm(e) {
        const me = this;
        let sts = me.#validateCaller(e, e.target, 'submit', 'GS-POPUP');
        if (!sts) return;
        GSEvent.prevent(e);
        sts = GSEvent.send(me, 'data', { type: 'popup', data: e.detail.data, evt: e }, true, true, true);
        if (sts) me.close();
    }

    #validateCaller(e, own, type, comp) {
        if (e.detail.type !== type) return false;
        const parent = GSComponents.getOwner(own, comp);
        return parent == this;
    }
}