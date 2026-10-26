/*GSContextElement
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSContextElement class
 * @module components/GSContextElement
 */

import { GSDOM } from '../base/GSDOM.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSMenuElement } from './Menu.mjs';

/**
 * Renderer for context menu
 * @class
 * @extends {GSMenuElement}
 */
export class GSContextElement extends GSMenuElement {

    static properties = {
        target: {},
        filter: {},
        altContext: { type: Boolean, attribute: 'altcontext' },
        disabled: { type: Boolean },
    }

    #bindings = [];
    #onContextMenu = e => this.#onPopup(e);

    constructor() {
        super();
        const me = this;        
        me.auto = true;
        if (me.#isInTable) {
            me.slot = "extra";
            me.target = "tbody";
            me.filter = "[selected]";
            me.offset ="4";
        }
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.attachEvent(window, 'resize', me.close.bind(me));        
        if (!me.slot) me.#attachTarget();
    }

    disconnectedCallback() {
        this.#bindings = [];
        super.disconnectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has('target')) this.#attachTarget();
    }
    
    onSlotInjected(slot) {
        this.#attachTarget();
    }

    #attachTarget() {
        const me = this;
        me.#bindings.forEach(target => me.removeEvent(target, 'contextmenu', me.#onContextMenu));
        me.#bindings = [];
        const owner = GSDOM.parent(me.assignedSlot || me);
        let targets = me.target ? GSDOM.queryAll(owner, me.target) : [owner];
        if (!targets.length) targets = GSDOM.queryAll(document.documentElement, me.target);
        targets.filter(Boolean).forEach(target => {
            if (me.attachEvent(target, 'contextmenu', me.#onContextMenu)) me.#bindings.push(target);
        });
    }

    #match(e) {
        const selector = this.filter;
        const path = e.composedPath().filter(el => el instanceof Element);
        if (!selector) return path.some(el => el === e.currentTarget);
        return path.filter(el => el.matches(selector));
    }

    #onPopup(e) {
        const me = this;
        if (me.disabled) return false;
        if (e.shiftKey && me.altContext) return;
        const list = me.#match(e);
        if (list.length === 0) return;
        GSEvents.prevent(e);
        me.popup(e);
        return true;
    }

    get #isInTable() {
        return this.parentComponent?.tagName === 'GS-TABLE';
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
