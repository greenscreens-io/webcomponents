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
import GSID from "../base/GSID.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * SVG overlay renderer around selected target.
 * <gs-overlay target="#GSId-30-nav" autoremove></gs-overlay>
 * @class
 * @extends {GSElement}
 */
export default class GSOverlay extends GSElement {

    static #attrs = ['target', 'opacity', 'color', 'radius', 'padding'];

    #tid = 0;
    #svgid = GSID.id;

    static {
        customElements.define('gs-overlay', GSOverlay);
        Object.seal(GSOverlay);
    }

    static get attributes() {
        return GSOverlay.#attrs;
    }

    static get observedAttributes() {
        return GSElement.observeAttributes(GSOverlay.#attrs);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        if (GSOverlay.attributes.includes(name)) {
            if (name === 'target') {
                me.#updateSVG(oldValue, newValue);
            } else {
                me.#updateSVG('', me.target);
            }
        }
    }

    connectedCallback() {
        const me  = this;
        me.attachEvent(window, 'resize', me.#onResize.bind(me));
        super.connectedCallback();
    }

    disconnectedCallback() {
        this.svg?.remove();
        super.disconnectedCallback();
    }

    get isFlat() {
        return true;
    }

    get autoremove() {
        return this.hasAttribute('autoremove');
    }

    set autoremove(val) {
        return GSAttr.toggle(this, 'autoremove', GSUtil.asBool(val));
    }

    get target() {
        return GSAttr.get(this, 'target', '');
    }

    set target(val = '') {
        return GSAttr.set(this, 'target', val);
    }

    get overlayPadding() {
        return GSAttr.getAsNum(this, 'padding', 1);
    }

    set overlayPadding(val = 1) {
        return GSAttr.setAsNum(this, 'padding', val);
    }

    get overlayRadius() {
        return GSAttr.getAsNum(this, 'radius', 6);
    }

    set overlayRadius(val = 6) {
        return GSAttr.setAsNum(this, 'radius', val);
    }

    get overlayColor() {
        return GSAttr.get(this, 'color', 'rgb(0,0,0)');
    }

    set overlayColor(val = '') {
        return GSAttr.set(this, 'color', val);
    }

    get overlayOpacity() {
        return GSAttr.getAsNum(this, 'opacity', 0.7);
    }

    set overlayOpacity(val = 0.7) {
        return GSAttr.setAsNum(this, 'opacity', val);
    }

    get svg() {
        return GSDOM.getByID(this.#svgid);
    }

    get path() {
        return GSDOM.query(this.svg, 'path');
    }

    open() {
        const me = this;
        me.#updateSVG('', me.target);
    }

    close() {
        const me = this;
        const svg = me.svg;
        me.removeEvent(svg, 'click');
        svg?.remove();
    }
    
    reset() {
        const me = this;
        if (me.autoremove) me.close();
    }

    #onResize() {
        const me = this;
        me.close();
        clearTimeout(me.#tid);
        me.#tid = setTimeout(() => me.open(), 200);
    }

    #updateSVG(oldTarget = '', newTarget = '') {
        const me = this;
        if (oldTarget === newTarget) return;
        if (!newTarget) return me.svg?.remove();
        const el = GSDOM.query(newTarget);
        if (!el) return;

        const svg = me.svg || me.#createSVG();
        const path = me.path || me.#createSVGPath();
        const pathStr = me.#createSVGPathString(el);
        svg.setAttribute("viewBox", me.#viewBox);
        path.setAttribute("d", pathStr);
        if (!me.svg) {
            svg.appendChild(path);
            document.body.appendChild(svg);
            me.attachEvent(svg, 'click', me.reset.bind(me));
        }

    }

    get #viewBox() {
        return `0 0 ${window.innerWidth} ${window.innerHeight}`;
    }

    #createSVG() {

        const me = this;


        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = me.#svgid;
        svg.classList.add("gs-overlay", "gs-overlay-animated");

        svg.setAttribute("viewBox", me.#viewBox);
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