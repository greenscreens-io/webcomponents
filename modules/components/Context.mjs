/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSDContextElement class
 * @module components/GSDContextElement
 */

import { GSDOM } from '../base/GSDOM.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSMenuElement } from './Menu.mjs';

/**
 * Renderer for panel layout 
 * @class
 * @extends {GSMenuElement}
 */
export class GSDContextElement extends GSMenuElement {

    static properties = {
        target: {},
        altContext: { type: Boolean },
        disabled: { type: Boolean },
    }

    constructor() {
        super();
        this.auto = true;
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.attachEvent(window, 'resize', me.close.bind(me));
        me.#attachTarget();
    }
    
    #attachTarget() {
        const me = this;
        const targets = GSDOM.queryAll(document.documentElement, me.target);
        targets.forEach(target => me.attachEvent(target, 'contextmenu', me.#onPopup.bind(me)));
    }

    #match(e) {
        const me = this;
        return e.composedPath().filter(el => el.matches)
            .filter(el => el.matches(me.target));
    }

    #onPopup(e) {
        const me = this;
        if (e.shiftKey && me.altContext) return;
        const list = me.#match(e);
        if (list.length === 0) return;
        GSEvents.prevent(e);
        me.popup(e);
        return true;
    }

    /**
     * Show submenu at x/y position on the screen
     * @param {Number} x 
     * @param {Number} y 
     * @returns {void}
     */
    popup(x = 0, y = 0, caller) {
        return this.disabled ? false : super.popup(x, y, caller);
    }

    static {
        this.define('gs-context');
    }
}
