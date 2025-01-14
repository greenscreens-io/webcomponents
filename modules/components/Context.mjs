/*GSContextElement
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSContextElement class
 * @module components/GSContextElement
 */

import { GSDOM } from '../base/GSDOM.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSMenuElement } from './Menu.mjs';

/**
 * Renderer for panel layout 
 * @class
 * @extends {GSMenuElement}
 */
export class GSContextElement extends GSMenuElement {

    static properties = {
        target: {},
        filter: {},
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
        if (!me.slot) me.#attachTarget();
    }
    
    onSlotInjected(slot) {
        this.#attachTarget();
    }

    #attachTarget() {
        const me = this;        
        const owner = GSDOM.parent(me.assignedSlot || me);
        let targets = me.target ? GSDOM.queryAll(owner, me.target) : [owner];
        if (!targets.length) targets = GSDOM.queryAll(document.documentElement, me.target);
        targets.forEach(target => me.attachEvent(target, 'contextmenu', me.#onPopup.bind(me)));
    }

    #match(e) {
        const me = this;
        return e.composedPath().filter(el => el.matches)
            .filter(el => el.matches(me.target || me.filter));
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
