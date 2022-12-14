/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSUListExt class
 * @module components/ext/GSUListExt
 */

import GSDOM from "../../base/GSDOM.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSAccessibility from "./GSAccessibility.mjs";

export default class GSUListExt extends HTMLUListElement {

    connectedCallback() {
        const me = this;
        GSEvents.attach(me, me, 'keydown', me.#onKeyDown.bind(me));
    }

    disconnectedCallback() {
        GSEvents.deattachListeners(this);
    }

    #onKeyDown(e) {

        const idx = GSAccessibility.KEYS.indexOf(e.code);
        if (idx < 0) return;
        GSEvents.prevent(e);

        const me = this;

        let el = me.#item;
        if (!el) return;

        if (idx < 2) return GSAccessibility.click(me.#target(el), e);

        if (me.#onSubmenu(el, idx)) return;
        

        el = me.#next(el, idx);
        me.#target(el)?.focus();

    }

    #target(el) {
        return el?.querySelector(GSDOM.QUERY_FOCUSABLE);
    }

    #next(el, idx) {
        const dir = GSAccessibility.idxToDir(idx);
        const list = Array.from(this.children).filter(el => el.matches('li:not([data-inert="true"])'));
        let i = list.indexOf(el) + dir;
        i = i >= list.length ? 0 : i;
        i = i < 0 ? list.length - 1 : i;
        return list[i];
    }

    get #item() {
        const el = GSDOM.activeElement;
        return (el.tagName === 'LI') ? el : el.closest('li');
    }

    get isSubmenu() {
        return this.matches('.submenu');
    }

    #onSubmenu(el, idx) {
        if (idx < 4) return false;
        const dir = GSAccessibility.idxToDir(idx);
        let submenu = el.querySelector('.submenu') || this;
        if (!submenu.matches('.submenu')) return false;
        const start = GSUtil.asBool(submenu.dataset.start);
        const end = GSUtil.asBool(submenu.dataset.end);
        const open = (start && dir < 0) || (end && dir > 0);
        GSDOM.toggleClass(submenu, 'show', open);
        submenu = open ? submenu : submenu.parentElement;
        submenu.querySelector(GSDOM.QUERY_FOCUSABLE)?.focus();
        return true;
    }

    static {
        customElements.define('gs-ext-ul', GSUListExt, { extends: 'ul' });
        Object.seal(GSUListExt);
    }
}