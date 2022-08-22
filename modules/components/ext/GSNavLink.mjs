/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSNavLink class
 * @module components/ext/GSNavLink
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSDOMObserver from '../../base/GSDOMObserver.mjs';
import GSComponents from "../../base/GSComponents.mjs";
import GSEvent from "../../base/GSEvent.mjs";

/**
 * Add Bootstrap item click / selection processsing.
 * For all A tags set as gs-navlink type this class will toggle "active" class
 * <a is="gs-navlink">
 * @class
 * @extends {HTMLAnchorElement}
 */
export default class GSNavLink extends HTMLAnchorElement {

    static CSS_TAB_ACTIVE = "text-bg-primary";
    static CSS_TAB_INACTIVE = "text-bg-secondary";

    static {
        customElements.define('gs-navlink', GSNavLink, { extends: 'a' });
        GSDOMObserver.registerFilter(GSNavLink.#onMonitorFilter, GSNavLink.#onMonitorResult);
        GSDOMObserver.registerFilter(GSNavLink.#onMonitorFilter, GSNavLink.#onMonitorRemove, true);
    }

    static #onMonitorFilter(el) {
        let isValid = el instanceof HTMLElement && GSUtil.getAttribute(el, 'is') !== 'gs-navlink';
        if (isValid) {
            const cl = el.classList;
            isValid = !el.hasAttribute('ignore') && (cl.contains('nav-link') || cl.contains('list-group-item'));

        }
        return isValid;
    }

    static #onMonitorResult(el) {
        GSNavLink.#attachEvents(el);
    }

    static #onMonitorRemove(el) {
        GSEvent.deattachListeners(el);
    }

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSNavLink.#attachEvents(me);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        //GSComponents.remove(this);
        GSEvent.deattachListeners(this);
    }

    static #attachEvents(own) {
        GSEvent.attach(own, own, 'click', GSNavLink.#onClick.bind(own));
    }

    static #onClick(e, own) {
        const me = own || this;
        const accept = GSUtil.getAttributeAsBool(me, 'data-selectable', true);
        if (!accept) return GSNavLink.#trigger(e, me);
        const nav = GSNavLink.#nav(me);
        const list = GSNavLink.#list(me);
        const panel = GSNavLink.#panel(me);
        const panelItem = GSNavLink.#panelItem(me);
        requestAnimationFrame(() => {
            if (list) list.querySelectorAll('.list-group-item').forEach(el => GSUtil.toggleClass(el, false, 'active'));
            if (nav) nav.querySelectorAll('.nav-link').forEach(el => GSUtil.toggleClass(el, false, 'active'));
            if (panel) panel.querySelectorAll('.tab-pane').forEach(el => GSUtil.toggleClass(el, false, 'active show'));
            GSUtil.toggleClass(me, true, 'active');
            GSUtil.toggleClass(panelItem, true, 'active show');
            GSNavLink.#trigger(e, me);
        });

    }

    static #trigger(e, el) {
        const attrs = GSUtil.getDataAttrs(el);
        const own = GSComponents.getOwner(el);
        GSEvent.send(own, 'action', { type: 'active', data: attrs, source: e }, true);
    }

    static #list(own) {
        return own.closest('.list-group');
    }

    static #nav(own) {
        return own.closest('.nav');
    }

    static #panel(own) {
        const item = GSNavLink.#panelItem(own);
        return item ? item.closest('.tab-content') : null;
    }

    static #panelItem(own) {
        const nav = GSNavLink.#nav(own);
        const tgtID = GSUtil.getAttribute(own, 'data-bs-target');
        return tgtID ? GSNavLink.#owner(nav).querySelector(tgtID) : null;
    }

    static #owner(own) {
        const parent = GSComponents.getOwner(own);
        return GSUtil.unwrap(parent);
    }
}
