/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { svg, html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

export class GSOverlayElement extends GSElement {

    static properties = {
        color: {},
        target: {},
        autoremove: { type: Boolean },
        opened: { type: Boolean },
        opacity: { type: Number },
        padding: { type: Number },
        radius: { type: Number },
    }

    #styleID = GSID.id;
    #styleID2 = GSID.id;

    constructor() {
        super();
        //this.color = 'rgb(0,0,0)';
        this.color = '#000';
        this.opacity = 0.7;
        this.padding = 1;
        this.radius = 6;
        this.dynamicStyle(this.#styleID);
        this.dynamicStyle(this.#styleID2);
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.attachEvent(window, 'resize', () => me.requestUpdate());
    }

    renderUI() {
        const me = this;
        if (!me.opened) return '';
        const path = me.#path;
        return path ? html`<svg xmlns="http://www.w3.org/2000/svg" xmlns:space="preserve"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1" preserveAspectRatio="xMinYMin slice"
            viewBox="0 0 ${window.innerWidth} ${window.innerHeight}"
            class="gs-overlay gs-overlay-animated ${me.#styleID}"
            @click="${me.reset.bind(me)}">
            ${path}
        </svg>` : '';
    }

    async firstUpdated(changed) {
        const me = this;
        const opt = {
            fillRule: "evenodd",
            clipRule: "evenodd",
            strokeLinejoin: "round",
            strokeMiterlimit: "2",
            zIndex: "10000",
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%"
        };
        me.dynamicStyle(me.#styleID, opt);
        super.firstUpdated(changed);
    }

    open() {
        this.opened = true;
    }

    close() {
        this.opened = false;
    }

    toggle() {
        this.opened = !this.opened;
    }

    reset() {
        const me = this;
        if (me.autoremove) me.close();
    }

    get #path() {
        const me = this;
        const el = GSDOM.query(me.target);
        if (!me.target) return '';
        const pathStr = me.#createSVGPathString(el);
        const opt = { fill: me.color, opacity: me.opacity, pointerEvents: 'auto', cursor: 'auto' };
        me.dynamicStyle(me.#styleID2, opt);
        return svg`<path class="${me.#styleID2}"  d="${pathStr}"></path>`;
    }

    #createSVGPathString(target) {

        const me = this;
        const windowX = window.innerWidth;
        const windowY = window.innerHeight;

        const rect = target.getBoundingClientRect();

        const padding = me.padding;
        const radius = me.radius;

        const width = rect.width + padding * 2;
        const height = rect.height + padding * 2;

        // prevent glitches when stage is too small for radius
        const limitedRadius = Math.min(radius, width / 2, height / 2);

        // no value below 0 allowed + round down
        const normalizedRadius = Math.floor(Math.max(limitedRadius, 0));

        const highlightBoxX = rect.x - padding + normalizedRadius;
        const highlightBoxY = rect.y - padding;
        const highlightBoxWidth = width - normalizedRadius * 2;
        const highlightBoxHeight = height - normalizedRadius * 2;

        const val = `M${windowX},0L0,0L0,${windowY}L${windowX},${windowY}L${windowX},0Z
            M${highlightBoxX},${highlightBoxY} 
            h${highlightBoxWidth} 
            a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},${normalizedRadius} 
            v${highlightBoxHeight} 
            a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},${normalizedRadius} 
            h-${highlightBoxWidth} 
            a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},-${normalizedRadius} 
            v-${highlightBoxHeight} 
            a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},-${normalizedRadius} z`;
        return val.replace(/[\t\n]/g, ' ');
    }

    static {
        this.define('gs-overlay');
    }

}