/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSStep class
 * @module components/steps/GSStep
 */

import GSElement from "../../base/GSElement.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";

/**
 * GSStep a signle element
 * @class
 * @extends {GSElement}
 */
export default class GSStep extends GSElement {

    static INACTIVE = 'text-bg-light';
    static SELECTED = 'text-bg-secondary';
    static COMPLETED = 'text-bg-primary';

    static {
        customElements.define('gs-step', GSStep);
        Object.seal(GSStep);
    }

    static get observedAttributes() {
        const attrs = ['title', 'icon', 'color'];
        return GSElement.observeAttributes(attrs);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        if (name === 'icon') {
            me.#iconVal = newValue;
        }
        if (name === 'title') {
            me.#titleVal = newValue;
        }
        if (name === 'color') {
            me.#colorVal(oldValue || GSStep.INACTIVE, newValue);
        }
    }

    #colorVal(oldValue = '', newValue = '') {
        const el = this.query('.step-icon');
        GSDOM.toggleClass(el, oldValue, false);
        GSDOM.toggleClass(el, newValue, true);
    }

    set #iconVal(val = '') {
        const el = this.query('i');
        GSAttr.set(el, 'class', val);
    }

    set #titleVal(val = '') {
        this.query('.step-title').innerText = val;
    }

    get title() {
        return GSAttr.get(this, 'title');
    }

    set title(val = '') {
        GSAttr.set(this, 'title', val);
    }

    get icon() {
        return GSAttr.get(this, 'icon');
    }

    set icon(val = '') {
        GSAttr.set(this, 'icon', val);
    }

    get color() {
        return GSAttr.get(this, 'color', GSStep.INACTIVE);
    }

    set color(val = '') {
        return GSAttr.set(this, 'color', val || GSStep.INACTIVE);
    }

    get iconCSS() {
        return GSAttr.get(this, 'icon-css', 'border rounded-circle fs-1');
    }

    get titleCSS() {
        return GSAttr.get(this, 'title-css', 'mb-0 fs-6 mt-3 fw-bold');
    }

    async getTemplate(val = '') {
        const me = this;
        return `
            <div class="step d-block w-100 text-center mb-4">
                <div class="step-icon-wrap d-block w-100 text-center position-relative">
                    <div class="step-icon position-relative d-inline-block ${me.iconCSS} ${me.color}">
                        <i class="${me.icon}"></i>
                    </div>
                </div>
                <div class="step-title ${me.titleCSS}">${me.title}</div>
            </div>`;
    }

    get isWrap() {
        return false;
    }

    get isFlat() {
        return true;
    }

    get anchor() {
        return 'beforeend@.steps';
    }
}
