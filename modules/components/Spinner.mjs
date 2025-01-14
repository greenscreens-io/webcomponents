/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { classMap, css, html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { color } from '../properties/index.mjs';

export class GSSpinnerElement extends GSElement {

    static styles = css`.spinner-border { border: var(--bs-spinner-border-width) solid currentcolor; border-right-color: transparent; }`;

    static properties = {
        color: { ...color, reflect: true },
        small: { type: Boolean, reflect: true },
        pulsar: { type: Boolean }
    }

    constructor() {
        super();
    }

    renderUI() {
        const me = this;
        return html`<div class="${classMap(me.renderClass())}" role="status"></div>`;
    }

    renderClass() {
        const me = this;
        const css = {
            ...super.renderClass(),
            "spinner-border": !me.pulsar,
            "spinner-grow": me.pulsar,
            [`text-${me.color}`]: me.color,
            [`spinner-border-sm`]: !me.pulsar && me.small,
            [`spinner-grow-sm`]: me.pulsar && me.small,
        }
        return css;
    }

    static {
        this.define('gs-spinner');
    }

}
