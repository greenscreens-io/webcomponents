/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSStep class
 * @module components/steps/GSSteps
 */


import GSAttr from "../../base/GSAttr.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSItem from "../../base/GSItem.mjs";
import GSStep from "./GSStep.mjs";
import GSStepStyle from "./GSStepStyle.mjs";

/**
 * Steps walker prev/next track current step and update step status
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSSteps extends GSElement {

    #index = 0;

    static {
        customElements.define('gs-steps', GSSteps);
        Object.seal(GSSteps);
        GSStepStyle.style;
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    get steps() {
        return this.queryAll('gs-step');
    }

    get items() {
        return this.queryAll('gs-item');
    }

    get length() {
        return this.items.length;
    }

    get index() {
        return this.#index;
    }

    set index(val = 0) {
        const num = Number(val);
        if (!Number.isInteger(num) || num < 0 || num >= this.length) return;
        this.#index = num;
    }

    get current() {
        const steps = this.steps;
        if (!steps || steps.length === 0) return null;
        return steps[this.#index] || null;
    }

    get isFirst() {
        return this.#index === 0;
    }

    get isLast() {
        return this.length === 0 ? true : this.#index === this.length - 1;
    }

    #setActiveIndex(nextIndex = 0) {
        if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= this.length) return false;
        const prev = this.current;
        const current = this.steps[nextIndex];
        if (!current) return false;
        if (prev && prev !== current) prev.color = GSStep.INACTIVE;
        this.#index = nextIndex;
        current.color = GSStep.SELECTED;
        return current;
    }

    next() {
        const me = this;
        if (me.length === 0 || me.isLast) return false;
        const current = me.current;
        if (current) current.color = GSStep.COMPLETED;
        return me.#setActiveIndex(me.#index + 1);
    }

    previous() {
        const me = this;
        if (me.length === 0 || me.isFirst) return false;
        const current = me.current;
        if (current) current.color = GSStep.INACTIVE;
        return me.#setActiveIndex(me.#index - 1);
    }

    reset() {
        const me = this;
        me.steps.forEach(it => it.color = GSStep.INACTIVE);
        requestAnimationFrame(() => {
            me.#index = 0;
            const step = me.current;
            if (step) step.color = GSStep.SELECTED;
        });
    }

    async getTemplate(val = '') {
        const me = this;
        const items = GSItem.genericItems(me);
        const steps = items.map((el, idx) => me.#renderStep(el, idx)).join('');
        const css = 'steps d-flex flex-wrap flex-sm-nowrap justify-content-between padding-top-2x padding-bottom-1x';
        return `<div class="${css}"></div>${steps}`;
    }

    #renderStep(el, idx) {
        if (idx === 0) GSAttr.set(el, 'color', GSStep.SELECTED);
        return `<gs-step ${GSAttr.flatten(el)}></gs-step>`;
    }
  
}