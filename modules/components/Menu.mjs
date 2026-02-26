/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSMenuElement class
 * @module components/GSMenuElement
 */

import { classMap, ifDefined, html, ref, createRef } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { dataset } from '../directives/dataset.mjs';
import { GroupController } from '../controllers/GroupController.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

/**
 * Renderer for panel layout 
 * @class
 * @extends {Component}
 */
export class GSMenuElement extends GSElement {

    static properties = {
        storage: {},
        auto: { type: Boolean, reflect: true },
        opened: { type: Boolean, reflect: true },
        dark: { type: Boolean },
        reverse: { type: Boolean },
        offset: { type: Number },
        data: { type: Array },
    }

    // GS-ITEM attributes mapping
    static options = {
        name: {},
        title: {},
        header: {},
        color: {},
        icon: {},
        url: { default: '#' }
    }

    #menuRef = createRef();
    #styleID = GSID.id;
    #controller = null;

    constructor() {
        super();
        const me = this;
        me.offset = 0;
        me.dynamicStyle(me.#styleID);
        me.data = me.#proxify(me);
        me.#controller = new GroupController(this);
    }

    onBusEvent(e) {
       if (e.detail.owner != this) {
            this.opened = false;
       }
     }

    willUpdate(changed) {
        super.willUpdate(changed);
        if (changed.has('opened') && !this.opened) {
            this.#closeSubmenus();
        }
    }

    updated() {
        this.#updatePosition();
        if (this.opened) {
            this.#controller.notify();
        }
    }

    renderUI() {
        const me = this;
        return html`<ul 
            ${ref(me.#menuRef)}
            dir="${ifDefined(me.direction)}"
            class="dropdown-menu ${classMap(me.renderClass())}"
            data-gs-class="${me.#styleID}"
            data-menu="true"
            @mouseover="${me.#onMouseOver}"
            @mouseleave="${me.#onMouseLeave}"
            @keydown="${me.#onKeyDown}"
            @click="${me.#onClick}">
            ${me.#items(me.data)}
        </ul>`;
    }

    renderClass() {
        const me = this;
        const css = {
            ...super.renderClass(),
            'submenu': me.dataset.submenu,
            'dropdown-menu-dark': me.dark,
            [me.#styleID]: true,
            'show': me.opened,
            'dropend': !me.reverse,
            'dropstart': me.reverse,
        }
        return css;
    }

    close() {
        this.opened = false;
    }

    open() {
        this.opened = true;
    }

    toggle() {
        this.opened = !this.opened;
    }

    /**
     * Show at x/y position on the screen
     * @param {Number} x 
     * @param {Number} y 
     * @param {HTMLElement} caller
     * @returns {void}
     */
    popup(x = 0, y = 0, caller) {

        const me = this;
        // offset to render under the mouse,
        // important for GSGrid for better UI experience
        const offset = GSUtil.asNum(me.offset, 0);
        let target = caller;

        if (GSEvents.isMouseOrPointerEvent(x)) {
            const e = x;
            target = e.target;
            y = e.clientY;
            x = e.clientX;
            let offset = GSDOM.offsetParent(me);
            offset = offset ? offset.getBoundingClientRect() : null;
            x = x - (offset?.left || 0);
            y = y - (offset?.top || 0);
        }

        const cfg = { clientX: x - offset, clientY: y - offset, target: target };

        requestAnimationFrame(() => {
            const style = {
                position: 'fixed',
                top: '0px',
                left: '0px',
                translate: `${cfg.clientX}px ${cfg.clientY}px`
            };
            const rule = me.dynamicStyle(me.#styleID);
            Object.assign(rule.style, style);
        });
        me.open();

    }

    onDataRead(data) {
        this.data = data;
    }

    #items(root) {
        const me = this;
        return root.map(el => me.#item(el));
    }

    #item(el) {
        const me = this;
        const isSub = el.items?.length > 0;
        if (isSub) return me.#renderSubmenu(el);
        if (!(el.header || el.name)) return me.#renderDivider();
        return el.header ? me.#renderHeader(el) : me.#renderMenu(el);
    }

    #renderHeader(el) {
        return html`<li data-inert="true"><h6 class="dropdown-header">${this.#renderIcon(el)}${el.header}</h6></li>`;
    }

    #renderDivider() {
        return html`<li data-inert="true"><hr class="dropdown-divider"></li>`;
    }

    #renderSubmenu(el) {
        const me = this;
        return html`<li>
            <a class="dropdown-item dropdown-toggle" data-toggle="true" href="#">
                <div class="d-inline-block w-100">${me.#renderIcon(el)}${el.name}</div>
            </a>
            <gs-menu auto 
                .data=${el.items} 
                ?dark=${me.dark} 
                ?reverse="${me.reverse}" 
                language="${ifDefined(me.language)}" 
                data-submenu="true">
            </gs-menu>
        </li>`;
    }

    #renderIcon(el) {
        return el.icon ? html`<gs-icon css="mx-1" name="${el.icon}"></gs-icon>` : '';
    }

    #renderMenu(el) {
        return html`<li>
                <gs-button css="dropdown-item shadow-none" 
                    ${dataset(el, false)}
                    url="${el.url}"
                    title="${el.name}" 
                    language="${ifDefined(this.language)}" 
                    icon="${ifDefined(el.icon)}" 
                    text="${ifDefined(el.color)}"
                    data-gs-target="${ifDefined(el.target || 'self')}"
                    data-gs-action="${ifDefined(el.action)}">
                </gs-button></li>`;
    }

    /**
     * Proxify GS-ITEM elements to easily read attributes
     */
    #proxify(root) {
        return GSItem.collect(root).map(el => GSAttr.proxify(el, GSMenuElement.options));
    }

    #closeSubmenus(menu) {
        GSDOM.queryAll(this.renderRoot, 'gs-menu', false, false)
            .filter(el => el != menu)
            .forEach(el => el.close());
    }

    #onKeyDown(e) {
        const me = this;
        switch (e.key) {
            case 'Escape':
                me.close();
                break;
        }
    }

    #onClick(e) {
        GSEvents.prevent(e);
        const me = this;
        const submenu = me.#toSubmenu(e);
        submenu?.close();
        if (me.auto) me.close();
    }

    #onMouseLeave(e) {
        GSEvents.prevent(e);
        if (this.auto) this.close();
    }

    #onMouseOver(e) {
        GSEvents.prevent(e);
        const me = this;
        const submenu = me.#toSubmenu(e);
        me.#closeSubmenus(submenu);
        submenu?.open();
    }

    #toSubmenu(e) {
        const menuItem = e.target.closest('li');
        return menuItem?.querySelector('gs-menu');
    }

    #updatePosition() {
        const me = this;
        if (!me.opened) return;
        const rule = me.dynamicStyle(me.#styleID);
        if (me.isSubmenu) {
            const opt = { translate: `0px -25px` };
            if (me.reverse) {
                opt.left = 'inherited';
                opt.right = '100%';
            } else {
                opt.right = 'inherited';
                opt.left = '100%';
            }
            Object.assign(rule.style, opt);
        } else {
            rule.style.translate = null;
            const rect = me.#menu.getBoundingClientRect();
            const offset = window.innerWidth - rect.right;
            me.reverse = offset - 5 < 0;
            if (me.reverse) rule.style.translate = `${offset - 2}px`;
        }
    }

    get isSubmenu() {
        return this.dataset.submenu;
    }

    get #menu() {
        return this.#menuRef.value;
    }

    static {
        this.define('gs-menu');
    }
}
