/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSTooltip class
 * @module components/GSTooltip
 */

import GSID from "../base/GSID.mjs";
import GSDOMObserver from '../base/GSDOMObserver.mjs';
import GSElement from "../base/GSElement.mjs";
import GSPopper from "../base/GSPopper.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSEvents from "../base/GSEvents.mjs";

/**
 * Process Bootstrap tooltip efinition
 * <gs-tooltip placement="top" ref="#el_id" title="xxxxxx"></gs-tooltip>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSTooltip extends GSElement {

    static {
        customElements.define('gs-tooltip', GSTooltip);
        Object.seal(GSTooltip);
        GSDOMObserver.registerFilter(GSTooltip.#onMonitorFilter, GSTooltip.#onMonitorResult);
    }

    /**
     * Filter function for monitor observer
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #onMonitorFilter(el) {
        if (!(el instanceof HTMLElement)) return false;
        if (el.tagName && el.tagName.startsWith('GS-')) return false;
        return GSTooltip.#isTooltip(el) && !GSTooltip.#hasTooltip(el);
    }

    /**
     * Function to attach gstooltip to the element
     * @param {HTMLElement} el 
     */
    static async #onMonitorResult(el) {
        await GSUtil.timeout(1000);
        return GSEvents.waitAnimationFrame(() => {
            GSID.setIf(el);
            const tooltip = document.createElement('gs-tooltip');
            tooltip.ref = `#${el.id}`;
            el.parentElement.insertAdjacentElement('beforeend', tooltip);
        }, true);
    }

    constructor() {
        super();
    }

   	connectedCallback() {
        super.connectedCallback();
        // justified text
        const ccs = {
            "text-align": "justify !important",
            "text-justify": "inter-word",
            "word-break": "keep-all",
            "hyphens": "none"
        };
        GSCacheStyles.setRule(this.#tipID, ccs);
    }

    disconnectedCallback() {
        GSCacheStyles.deleteRule(this.#arrowID);
        GSCacheStyles.deleteRule(this.#tipID);
        super.disconnectedCallback();
    }

    onReady() {
        super.onReady();
        const me = this;
        me.#attachEvents();
    }

    // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
    #attachEvents() {
        const me = this;
        me.attachEvent(me.target, 'mouseenter', me.show.bind(me));
        me.attachEvent(me.target, 'mouseleave', me.hide.bind(me));
    }

    #popup() {
        const me = this;
        const arrowEl = me.querySelector('div.tooltip-arrow');
        GSPopper.popupFixed(me.placement, me.firstElementChild, me.target, arrowEl);
        return me.firstElementChild;
    }

    get #arrowID() {
        return `${this.styleID}-arrow`;
    }

    get #tipID() {
        return `${this.styleID}-tip`;
    }

    async #html() {
        const me = this;
        let content = me.preprocess ? me.#parse(me.title) : me.title; 
        if (me.title.startsWith('#')) {
            content = await me.getTemplate(me.title);
        }

        return `
         <div class="tooltip bs-tooltip-auto fade " data-popper-placement="${me.placement}" role="tooltip">
            <div class="tooltip-arrow ${me.#arrowID}" data-css-id="${me.#arrowID}"></div>
            <div class="tooltip-inner ${me.#tipID}" data-css-id="${me.#tipID}">${content}</div>
        </div>        
        `;
    }

    get target() {
        const me = this;
        if (me.ref) {
            let owner = me.owner;
            owner = GSDOM.isGSElement(me.owner) ? owner.self : owner;
            return owner.querySelector(me.ref);
        }
        return me.previousElementSibling || me.parentElement;
    }

    get ref() {
        const me = this;
        return GSAttr.get(me, 'ref');
    }

    set ref(val = '') {
        return GSAttr.set(this, 'ref', val);
    }

    get title() {
        const me = this;
        return GSAttr.get(me, 'title') || GSAttr.get(me.target, 'title');
    }

    set title(val = '') {
        const me = this;
        return GSAttr.set(me, 'title', val);
    }

    get preprocess() {
        return GSAttr.getAsBool(this, 'preprocess');
    }

    set preprocess(val = false) {
        return GSAttr.setAsBool(this, 'preprocess', val);
    }

    get placement() {
        const me = this;
        return GSAttr.get(me, 'placement', me.target?.dataset?.bsPlacement || 'top');
    }

    set placement(val = '') {
        return GSAttr.set(this, 'placement', val);
    }

    get isFlat() {
        return true;
    }

    /**
     * Show tooltip
     */
    show() {
        const me = this;
        requestAnimationFrame(async () => {
            const content = await me.#html();
            const el = GSDOM.parse(content, true);
            me.insertAdjacentElement('afterbegin', el);
            me.#popup();
            GSDOM.toggleClass(me.firstElementChild, 'show', true);
        });
    }

    /**
     * Hide tooltip
     */
    hide() {
        const me = this;
        setTimeout(() => {
            // GSDOM.setHTML(me, '');
            // me.firstChild?.remove();
            Array.from(me.childNodes).forEach(el => el.remove());
        }, 250);
        return GSDOM.toggleClass(me.firstElementChild, 'show', false);
    }

    /**
     * Toggle tooltip on/off
     */
    toggle() {
        const me = this;
        me.childElementCount > 0 ? me.hide() : me.show();
    }

    /**
     * A simple modified MarkDown
     * 
     * &#10; - new line 
     * ** - bold
     * *  - italic
     * *** - both
     * --- hr
     * $ - strong 
     * % - small 
     * 
     * @param {*} text 
     * @returns 
     */
    #parse(text) {
        if (!text) return '';

        // 1. Normalize line breaks and handle common HTML entities
        let normalized = text.replace(/&#10;/g, '\n');

        // 2. Tokenize or split safely by newlines OR sentence endings (. ! ?) 
        // This lookbehind handles spaces after punctuation perfectly without losing the character.
        let lines = normalized
            .split(/(?<=[!\.\?]+)(?=\s|---|%)|\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        let htmlOutput = '';
        let inSmallBlock = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // Structural Rule: Small block toggle
            if (line === '%') {
                if (!inSmallBlock) {
                    htmlOutput += '<small class="text-warning ">';
                    inSmallBlock = true;
                } else {
                    htmlOutput += '</small>';
                    inSmallBlock = false;
                }
                continue;
            }

            // Structural Rule: Horizontal Rule
            if (line === '---') {
                htmlOutput += '<hr class="">';
                continue;
            }

            // Inline formatting replacements (Fixed regex syntax)
            line = line
                .replace(/\$(.*?)\$/g, '<strong>$1</strong>')
                .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');

            // Render layout tags based on block state
            if (inSmallBlock) {
                // Check if the line is purely a strong label header (e.g., <strong>NOTE:</strong>)
                if (line.startsWith('<strong>') && line.endsWith('</strong>')) {
                    htmlOutput += line + ' ';
                } else {
                    // Mimic the exact spacing requirements from your target template
                    let pClass = htmlOutput.endsWith('</strong> ') ? 'mb-1' : '';
                    if (pClass) {
                        htmlOutput += `<p class="${pClass}">${line}</p> `;
                    } else {
                        htmlOutput += `<p>${line}</p>`;
                    }
                }
            } else {
                // Default outer paragraphs
                htmlOutput += `<p class="text-start mb-1">${line}</p>`;
            }
        }

        // Fallback cleanup if structural tags are left unclosed
        if (inSmallBlock) {
            htmlOutput += '</small>';
        }

        return htmlOutput;
    }

    /**
     * Check if element has attached tooltip
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #hasTooltip(el) {
    return (el?.firstElementChild || el?.nextElementSibling) instanceof GSTooltip;
}

    /**
     * Check if standard element is tooltip defined
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #isTooltip(el) {
    return el?.title && el?.dataset?.bsToggle === 'tooltip';
}

}

