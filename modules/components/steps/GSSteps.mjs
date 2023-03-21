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
        const me = this;
        if (val < 0 || val >= me.length) return;
        me.#index = val;
    }

    get current() {
        const me  = this;
        return me.steps[me.#index];
    }

    get isFirst() {
        return this.#index === 0;
    }

    get isLast() {
        return this.#index === this.length-1;
    }

    next() {
        const me = this;
        if (me.isLast) return false;
        me.current.color = GSStep.COMPLETED;
        me.index++;
        me.current.color = GSStep.SELECTED;
        return me.current;
    }

    previous() {
        const me = this;
        if (me.isFirst) return false;
        me.current.color = GSStep.INACTIVE;
        me.index--;
        me.current.color = GSStep.SELECTED;
        return me.current;
    }

    reset() {
        const me = this;
        me.steps.forEach(it => it.color = GSStep.INACTIVE);
        requestAnimationFrame(() => {
            me.#index = 0;
            me.current.color = GSStep.SELECTED;
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