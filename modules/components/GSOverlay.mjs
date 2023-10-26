/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */

/**
 * A module loading GSOverlay class
 * @module components/GSOverlay
 */

import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSElement from "../base/GSElement.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSID from "../base/GSID.mjs";

/**
 * SVG overlay renderer around selected target.
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSOverlay extends GSElement {

    #svgid = GSID.id;

    static {
        customElements.define('gs-overlay', GSOverlay);
        Object.seal(GSOverlay);
    }

    static get observedAttributes() {
        const attrs = ['target'];
        return GSElement.observeAttributes(attrs);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        if (name === 'target') {
            me.#updateSVG(oldValue, newValue);
        }
    }

    disconnectedCallback() {
        this.svg?.remove();
        super.disconnectedCallback();
    }

    get target() {
        return GSAttr.get(this, 'target', '');
    }

    set target(val = '') {
        return GSAttr.set(this, 'target', val);
    }

    get overlayPadding() {
        return GSAttr.getAsNum(this, 'overlay-padding', 0);
    }

    set overlayPadding(val = 0) {
        return GSAttr.setAsNum(this, 'overlay-padding', val);
    }

    get overlayRadius() {
        return GSAttr.getAsNum(this, 'overlay-radius', 0);
    }

    set overlayRadius(val = 0) {
        return GSAttr.setAsNum(this, 'overlay-radius', val);
    }

    get overlayColor() {
        return GSAttr.get(this, 'overlayColor', 'rgb(0,0,0)');
    }

    set overlayColor(val = '') {
        return GSAttr.set(this, 'overlayColor', val);
    }

    get overlayOpacity() {
        return GSAttr.getAsNum(this, 'overlayOpacity', 0.7);
    }

    set overlayOpacity(val = 0.7) {
        return GSAttr.setAsNum(this, 'overlayOpacity', val);
    }

    get svg() {
        return GSDOM.query(this.#svgid);
    }

    get path() {
        return GSDOM.query(this.#svgid, 'path');
    }

    #updateSVG(oldTarget = '', newTarget = '') {
        const me = this;
        if (oldTarget != newTarget) me.svg?.remove();
        const el = GSDOM.query(newTarget);
        if (!GSDOM.isHTMLElement(el)) return;

        const svg = me.svg || me.#createSVG();
        const path = me.path || me.#createSVGPath();
        const pathStr = me.#createSVGPathString(el);
        path.setAttribute("d", pathStr);
        svg.appendChild(path);
        if (!me.svg) document.body.appendChild(svg);

    }

    #createSVG() {

        const me = this;
        
        const windowX = window.innerWidth;
        const windowY = window.innerHeight;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = me.#svgid;
        svg.classList.add("gs-overlay", "gs-overlay-animated");

        svg.setAttribute("viewBox", `0 0 ${windowX} ${windowY}`);
        svg.setAttribute("xmlSpace", "preserve");
        svg.setAttribute("xmlnsXlink", "http://www.w3.org/1999/xlink");
        svg.setAttribute("version", "1.1");
        svg.setAttribute("preserveAspectRatio", "xMinYMin slice");

        svg.style.fillRule = "evenodd";
        svg.style.clipRule = "evenodd";
        svg.style.strokeLinejoin = "round";
        svg.style.strokeMiterlimit = "2";
        svg.style.zIndex = "10000";
        svg.style.position = "fixed";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        return svg;
    }

    #createSVGPath() {
        
        const me = this;

        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.style.fill = me.overlayColor;
        pathEl.style.opacity = me.overlayOpacity;
        pathEl.style.pointerEvents = "auto";
        pathEl.style.cursor = "auto";
        return pathEl;
    }

    #createSVGPathString(target) {
        
        const me = this;
        const windowX = window.innerWidth;
        const windowY = window.innerHeight;
        
        const rect = target.getBoundingClientRect()

        const padding = me.overlayPadding;
        const radius = me.overlayRadius;
      
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
      
        return `M${windowX},0L0,0L0,${windowY}L${windowX},${windowY}L${windowX},0Z
          M${highlightBoxX},${highlightBoxY} 
          h${highlightBoxWidth} 
          a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},${normalizedRadius} 
          v${highlightBoxHeight} 
          a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},${normalizedRadius} 
          h-${highlightBoxWidth} 
          a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},-${normalizedRadius} 
          v-${highlightBoxHeight} 
          a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},-${normalizedRadius} z`;      
    }

}