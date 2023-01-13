/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAccessibility class
 * @module components/ext/GSAccessibility
 */

import GSDOM from "../../base/GSDOM.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSUtil from "../../base/GSUtil.mjs";

export default class GSAccessibility {

    static KEYS = ['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    static #active = false;

    static #onKeyDown(e) {

        const idx = GSAccessibility.KEYS.indexOf(e.code);
        if (idx < 0) return;

        const focused = GSDOM.activeElement;
        if (!focused.matches(GSDOM.QUERY_FOCUSABLE)) return;

        if (idx < 2) return GSAccessibility.click(focused, e);

        const editable = ['INPUT', 'SELECT', 'TEXTAREA'].indexOf(focused.tagName) > -1;
        if (editable && !e.altKey) return;

        GSEvents.prevent(e);

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
        const list = GSDOM.queryAll(GSDOM.QUERY_FOCUSABLE).filter(el => GSDOM.isVisible(el));
        let i = list.indexOf(focused) + dir;
        i = i >= list.length ? 0 : i;
        i = i < 0 ? list.length - 1 : i;
        return list[i];
    }

    static start() {
        if (GSAccessibility.#active) return;
        GSEvents.listen(document.body, null, 'keydown', GSAccessibility.#onKeyDown);
        GSAccessibility.#active = true;
        return GSAccessibility.#active;
    }

    static stop() {
        if (!GSAccessibility.#active) return;
        GSEvents.unlisten(document.body, null, 'keydown', GSAccessibility.#onKeyDown);
        GSAccessibility.#active = false;
        return GSAccessibility.#active;
    }

    static get active() {
        return GSAccessibility.#active;
    }

    static set active(val) {
        return GSUtil.asBool(val) ? GSAccessibility.start() : GSAccessibility.stop();
    }

    static {
        GSAccessibility.start();
    }
}