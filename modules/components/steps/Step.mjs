/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSStepElement class
 * @module components/steps/GSStepElement
 */

import { html, ifDefined } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';

/**
 * GSStep a signle element
 * @class
 * @extends {Component}
 */
export default class GSStepElement extends GSElement {

    static INACTIVE = 'text-bg-light';
    static SELECTED = 'text-bg-primary';
    static COMPLETED = 'text-bg-secondary';

    static ICON_CSS = 'border rounded-circle fs-1';
    static TITLE_CSS = 'mb-0 fs-6 mt-3 fw-bold';

    static properties = {
        title: {},
        icon: {},
        color: {},
        iconCSS: { attribute: 'icon-css' },
        titleCSS: { attribute: 'title-css' },
    }

    constructor() {
        super();
        const clazz = GSStepElement;
        this.icon = clazz.INACTIVE;
        this.iconCSS = clazz.ICON_CSS;
        this.titleCSS = clazz.TITLE_CSS;
    }

    renderUI() {
        const me = this;
        return html`
        <div class="step d-block w-100 text-center mb-4"  dir="${ifDefined(me.direction)}">
            <div class="step-icon-wrap d-block w-100 text-center position-relative">
                <div class="step-icon position-relative d-inline-block ${me.iconCSS} ${me.color || GSStepElement.INACTIVE}">
                    ${me.#renderIcon()}
                </div>
            </div>
            <div class="step-title ${me.titleCSS}">${me.translate(me.title)}</div>
        </div>        
        `;
    }

    #renderIcon() {
        return this.icon ? html`<gs-icon name="${this.icon}"></gs-icon>` : html`<slot name="icon"></slot>`;
    }

    static {
        this.define('gs-step');
    }

}
