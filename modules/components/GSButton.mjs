/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSButton class
 * @module components/GSButton
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSItem from "../base/GSItem.mjs";

/**
 * https://getbootstrap.com/docs/5.1/components/buttons/
 * Process Bootstrap button definition
 * <gs-button css="btn-primary" title="focus hover" toggle="offcanvas|collapse|dropdown|button|tab|pill|popover|tooltip|modal" dismiss="offcanvas|modal|alert" target="css selector"></gs-button>
 * @class
 * @extends {GSElement}
 */
export default class GSButton extends GSElement {


    #state = false;

    static {
        customElements.define('gs-button', GSButton);
    }

    static get observedAttributes() {
        const attrs = ['css', 'dismiss', 'target', 'toggle', 'title', 'active', 'disable'];
        return GSUtil.mergeArrays(attrs, super.observedAttributes);
    }

    constructor() {
        super();
    }

    #onClick(e) {
        const me = this;
        if (me.disable) return false;
        GSUtil.sendEvent(me, 'action', { type: 'button', source: e }, true);
        if (me.active) {
            me.#state = !me.#state;
            GSUtil.toggleClass(me.firstElementChild, me.#state, 'active');
        }
    }

    onReady() {
        const me = this;
        const btn = me.findEl('button');
        me.attachEvent(btn, 'click', me.#onClick.bind(me));
        super.onReady();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const el = me.firstElementChild;
        me.#update(name, oldValue, newValue);
        GSUtil.setAttribute(el, `data-bs-${name}`, newValue);
    }

    #update(name = '', oldValue = '', newValue = '') {

        const me = this;
        const el = me.firstElementChild;

        if (name == 'title') return el.innerHTML = me.title;

        if (name == 'css') {
            GSUtil.toggleClass(el, false, oldValue);
            GSUtil.toggleClass(el, true, newValue);
        }

        if (name == 'active') return GSUtil.toggleClass(el, me.#state, 'active');
        if (name == 'disable') return GSUtil.setAttribute(this.firstElementChild, 'disabled', GSUtil.asBool(newValue) ? newValue : null);
    }

    get template() {
        const me = this;
        const disabled = me.disable ? 'disabled' : '';
        const icon = me.icon ? `<i class="${me.icon}"></i>` : '';
        // const content = me.rtl ? `${me.title} ${icon}` : `${icon} ${me.title}`;
        const content = `${icon} ${me.title}`;
        const action = GSItem.getActionAttr(me);
        const dissmis = GSItem.getDismissAttr(me);
        const target = GSItem.getTargetAttr(me);
        const toggle = GSItem.getToggleAttr(me);
        return `<button class="btn ${me.css}" ${action} ${toggle} ${target} ${dissmis} ${disabled} title="${me.comment}" role="tooltip">${content}</button>`;
    }

    get css() {
        const active = this.#state ? 'active' : '';
        return GSUtil.getAttribute(this, 'css') + ` ${active}`;
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css', val);
    }

    get action() {
        return GSUtil.getAttribute(this, 'action');
    }

    set action(val = '') {
        return GSUtil.setAttribute(this, 'action', val);
    }

    get dismiss() {
        return GSUtil.getAttribute(this, 'dismiss');
    }

    set dismiss(val = '') {
        return GSUtil.setAttribute(this, 'dismiss', val);
    }

    get icon() {
        return GSUtil.getAttribute(this, 'icon');
    }

    set icon(val = '') {
        return GSUtil.setAttribute(this, 'icon', val);
    }

    get target() {
        return GSUtil.getAttribute(this, 'target');
    }

    set target(val = '') {
        return GSUtil.setAttribute(this, 'target', val);
    }

    get toggle() {
        return GSUtil.getAttribute(this, 'toggle');
    }

    set toggle(val = '') {
        return GSUtil.setAttribute(this, 'toggle', val);
    }

    get comment() {
        return GSUtil.getAttribute(this, 'comment');
    }

    set comment(val = '') {
        return GSUtil.setAttribute(this, 'comment', val);
    }

    get title() {
        return GSUtil.getAttribute(this, 'title');
    }

    set title(val = '') {
        return GSUtil.setAttribute(this, 'title', val);
    }

    get active() {
        return GSUtil.getAttributeAsBool(this, 'active', false);
    }

    set active(val = '') {
        this.#state = GSUtil.asBool(val);
        return GSUtil.setAttribute(this, 'active', this.#state);
    }

    get disable() {
        return GSUtil.getAttributeAsBool(this, 'disable', false);
    }

    set disable(val = '') {
        val = GSUtil.asBool(val);
        return GSUtil.setAttribute(this, 'disable', val);
    }

    toggle() {
        this.active = !this.active;
    }

    /**
     * Prevent shadow dom
     */
    get isFlat() {
        return true;
    }

    get position() {
        return 'self';
    }

}
