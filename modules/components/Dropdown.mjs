/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSDropdownElement class
 * @module components/GSDropdownElement
 */

import { html, ifDefined } from '../lib.mjs';
import { cssMap } from '../directives/css-map.mjs';
import { color } from '../properties/color.mjs';
import { GSMenuElement } from './Menu.mjs';

/**
 * Renderer for panel layout 
 * @class
 * @extends {GSMenuElement}
 */
export class GSDropdownElement extends GSMenuElement {

    static properties = {
        icon: {},
        text: {...color},
        color: {...color},
        size: {},
        title: {},
        tooltip: {},
        group: {},
        simple: {type:Boolean}
    }

    constructor() {
        super();
        this.auto = true;
    }

    renderUI() {
        const me = this;
        return html`<div class="dropdown"  dir="${ifDefined(me.direction)}">
                ${me.#renderButton()}
                ${super.renderUI()}
            </div>`;
    }

    #buttonClass() {
        const me = this;
        const css = {
            ...super.renderClass(),
            'btn': true,
            [`btn-${me.color}`] : me.color ? true : false,
            'dropdown-toggle': !me.simple,
            'shadow-none' : true,
        }
        return css;
    }

    #renderButton() {
        const me = this;
        return html`<gs-link css="${cssMap(me.#buttonClass())}"
            url="#"         
            icon="${ifDefined(me.icon)}"
            text="${ifDefined(me.text)}"
            size="${ifDefined(me.size)}"
            title="${ifDefined(me.title)}"
            tooltip="${ifDefined(me.tooltip)}"
            @notify="${me.open}">
            </gs-link>`;
    }

    static {
        this.define('gs-dropdown');
    }
}
