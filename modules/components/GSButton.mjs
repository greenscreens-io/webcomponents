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
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";

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
        Object.seal(GSButton);
    }

    static get observedAttributes() {
        const attrs = ['css', 'dismiss', 'target', 'toggle', 'title', 'active', 'disable'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    } 

    #onClick(e) {
        const me = this;
        if (me.disable) return false;
        me.emit('action', { type: 'button', action: me.action, source: e }, true, true, true);
        if (me.active) {
            me.#state = !me.#state;
            GSDOM.toggleClass(me.firstElementChild, 'active', me.#state);
        }
        if (!me.select) me.#button?.blur();
    }

    onReady() {
        super.onReady();
        const me = this;
        me.attachEvent(me.#button, 'click', me.#onClick.bind(me));
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const el = me.firstElementChild;
        me.#update(name, oldValue, newValue);
        GSAttr.set(el, `data-bs-${name}`, newValue);
    }

    get #button() {
        return this.query('button');
    }

    #update(name = '', oldValue = '', newValue = '') {

        const me = this;
        const el = me.firstElementChild;

        if (name == 'title') return GSDOM.setHTML(el, me.title);

        if (name == 'css') {
            GSDOM.toggleClass(el, oldValue, false);
            GSDOM.toggleClass(el, newValue, true);
        }

        if (name == 'active') return GSDOM.toggleClass(el, 'active', me.#state);
        if (name == 'disable') return GSAttr.set(me.firstElementChild, 'disabled', GSUtil.asBool(newValue) ? newValue : null);
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
        return `<button type="${me.type}" class="btn ${me.css}" ${action} ${toggle} ${target} ${dissmis} ${disabled} title="${me.comment}" aria-label="${me.ariaLabel}">${content}</button>`;
    }

    get css() {
        const active = this.#state ? 'active' : '';
        return GSAttr.get(this, 'css') + ` ${active}`;
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get action() {
        return GSAttr.get(this, 'action');
    }

    set action(val = '') {
        return GSAttr.set(this, 'action', val);
    }

    get dismiss() {
        return GSAttr.get(this, 'dismiss');
    }

    set dismiss(val = '') {
        return GSAttr.set(this, 'dismiss', val);
    }

    get icon() {
        return GSAttr.get(this, 'icon');
    }

    set icon(val = '') {
        return GSAttr.set(this, 'icon', val);
    }

    get target() {
        return GSAttr.get(this, 'target');
    }

    set target(val = '') {
        return GSAttr.set(this, 'target', val);
    }

    get toggle() {
        return GSAttr.get(this, 'toggle');
    }

    set toggle(val = '') {
        return GSAttr.set(this, 'toggle', val);
    }

    get comment() {
        return GSAttr.get(this, 'comment');
    }

    set comment(val = '') {
        return GSAttr.set(this, 'comment', val);
    }

    get title() {
        return GSAttr.get(this, 'title');
    }

    set title(val = '') {
        return GSAttr.set(this, 'title', val);
    }

    get active() {
        return GSAttr.getAsBool(this, 'active', false);
    }

    set active(val = '') {
        this.#state = GSUtil.asBool(val);
        return GSAttr.set(this, 'active', this.#state);
    }

    get disable() {
        return GSAttr.getAsBool(this, 'disable', false);
    }

    set disable(val = '') {
        return GSAttr.getAsBool(this, 'disable', val);
    }

    get select() {
        return GSAttr.getAsBool(this, 'select', true);
    }

    set select(val = '') {
        return GSAttr.setAsBool(this, 'select', val);
    }

    get type() {
        return GSAttr.get(this, 'type', 'button');
    }

    set type(val = '') {
        return GSAttr.set(this, 'type', val);
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

    get anchor() {
        return 'self';
    }

}

