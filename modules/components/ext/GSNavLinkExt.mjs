/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSNavLinkExt class
 * @module components/ext/GSNavLinkExt
 */

import GSID from "../../base/GSID.mjs";
import GSDOMObserver from '../../base/GSDOMObserver.mjs';
import GSComponents from "../../base/GSComponents.mjs";
import GSEvent from "../../base/GSEvent.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";

/**
 * Add Bootstrap item click / selection processsing.
 * For all A tags set as gs-ext-navlink type this class will toggle "active" class
 * <a is="gs-ext-navlink">
 * @class
 * @extends {HTMLAnchorElement}
 */
export default class GSNavLinkExt extends HTMLAnchorElement {

    static CSS_TAB_ACTIVE = "text-bg-primary";
    static CSS_TAB_INACTIVE = "text-bg-secondary";

    static {
        customElements.define('gs-ext-navlink', GSNavLinkExt, { extends: 'a' });
        Object.seal(GSNavLinkExt);
        GSDOMObserver.registerFilter(GSNavLinkExt.#onMonitorFilter, GSNavLinkExt.#onMonitorResult);
        GSDOMObserver.registerFilter(GSNavLinkExt.#onMonitorFilter, GSNavLinkExt.#onMonitorRemove, true);
    }

    static #onMonitorFilter(el) {
        let isValid = el instanceof HTMLElement && GSAttr.get(el, 'is') !== 'gs-ext-navlink';
        if (isValid) {
            const cl = el.classList;
            isValid = !el.hasAttribute('ignore') && (cl.contains('nav-link') || cl.contains('list-group-item'));

        }
        return isValid;
    }

    static #onMonitorResult(el) {
        GSNavLinkExt.#attachEvents(el);
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
        GSNavLinkExt.#attachEvents(me);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        //GSComponents.remove(this);
        GSEvent.deattachListeners(this);
    }

    static #attachEvents(own) {
        GSEvent.attach(own, own, 'click', GSNavLinkExt.#onClick.bind(own));
    }

    static #onClick(e, own) {
        const me = own || this;
        const accept = me.dataset.selectable === 'false';
        if (accept) return GSNavLinkExt.#trigger(e, me);
        const nav = GSNavLinkExt.#nav(me);
        const list = GSNavLinkExt.#list(me);
        const panel = GSNavLinkExt.#panel(me);
        const panelItem = GSNavLinkExt.#panelItem(me);
        requestAnimationFrame(() => {
            if (list) list.querySelectorAll('.list-group-item').forEach(el => GSDOM.toggleClass(el, false, 'active'));
            if (nav) nav.querySelectorAll('.nav-link').forEach(el => GSDOM.toggleClass(el, false, 'active'));
            if (panel) panel.querySelectorAll('.tab-pane').forEach(el => GSDOM.toggleClass(el, false, 'active show'));
            GSDOM.toggleClass(me, true, 'active');
            GSDOM.toggleClass(panelItem, true, 'active show');
            GSNavLinkExt.#trigger(e, me);
        });

    }

    static #trigger(e, el) {
        const own = GSNavLinkExt.#owner(el);
        GSEvent.send(own, 'action', { type: 'active', data: el.dataset, source: e }, true);
    }

    static #list(own) {
        return own.closest('.list-group');
    }

    static #nav(own) {
        return own.closest('.nav');
    }

    static #panel(own) {
        const item = GSNavLinkExt.#panelItem(own);
        return item ? item.closest('.tab-content') : null;
    }

    static #panelItem(own) {
        const nav = GSNavLinkExt.#nav(own);
        const tgtID = own?.dataset.bsTarget;
        return tgtID ? GSNavLinkExt.#owner(nav).querySelector(tgtID) : null;
    }

    static #owner(own) {
        const parent = GSComponents.getOwner(own);
        return GSDOM.unwrap(parent);
    }
}

