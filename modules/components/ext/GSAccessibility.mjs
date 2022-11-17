/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAccessibility class
 * @module components/ext/GSAccessibility
 */

import GSDOM from "../../base/GSDOM.mjs";
import GSUtil from "../../base/GSUtil.mjs";

export default class GSAccessibility {

    static QUERY = "a[href]:not([tabindex='-1']),area[href]:not([tabindex='-1']),input:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']),textarea:not([disabled]):not([tabindex='-1']),button:not([disabled]):not([tabindex='-1']),iframe:not([tabindex='-1']),[tabindex]:not([tabindex='-1']),[contentEditable=true]:not([tabindex='-1'])";
    static KEYS = ['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    static #active = false;

    static #onKeyDown(e) {

        const idx = GSAccessibility.KEYS.indexOf(e.code);
        if (idx < 0) return;

        const focused = GSDOM.activeElement;
        if (!focused.matches(GSAccessibility.QUERY)) return;

        if (idx < 2) return GSAccessibility.click(focused, e);

        // prev (-1); next (1)
        const dir = GSAccessibility.idxToDir(idx);

        const next = GSAccessibility.#next(focused, dir);
        next?.focus();

    }

    static idxToDir(idx) {
        return idx === 2 || idx === 4 ? -1 : 1;
    }

    /**
     * Send click event to a focusable element
     * @param {*} focused 
     * @param {*} evt 
     */
    static click(focused, evt) {
        if (focused?.tagName === 'BUTTON') return;
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            shiftKey: evt.shiftKey,
            altKey: evt.altKey,
            ctrlKey: evt.ctrlKey
        });
        return focused.dispatchEvent(event);
    }

    /**
     * Get next focusable element
     * @param {*} focused 
     * @param {*} idx 
     * @returns 
     */
    static #next(focused, dir) {
        const list = GSDOM.queryAll(GSAccessibility.QUERY).filter(el => GSAccessibility.#isVisible(el));
        let i = list.indexOf(focused) + dir;
        i = i >= list.length ? 0 : i;
        i = i < 0 ? list.length - 1 : i;
        return list[i];
    }

    /**
     * Check if element is visible
     * @param {*} el 
     * @returns 
     */
    static #isVisible(el) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        return !GSDOM.isStyleValue(el, 'display', 'none') && GSUtil.asNum(GSDOM.styleValue(el, 'opacity')) > 0;
    }

    static start() {
        if (GSAccessibility.#active) return;
        GSEvent.listen(document.body, null, 'keydown', GSAccessibility.#onKeyDown);
        GSAccessibility.#active = true;
        return GSAccessibility.#active;
    }

    static stop() {
        if (!GSAccessibility.#active) return;
        GSEvent.unlisten(document.body, null, 'keydown', GSAccessibility.#onKeyDown);
        GSAccessibility.#active = false;
        return GSAccessibility.#active;
    }

    static get active() {
        return GSAccessibility.#active;
    }

    static set active(val) {
        const active = GSUtil.asBool(val);
        return active ? GSAccessibility.start() : GSAccessibility.stop();
    }

    static {
        GSAccessibility.start();
    }
}