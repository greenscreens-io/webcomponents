/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/**
 * A module loading GSStepsElement class
 * @module components/steps/GSStepsElement
 */

import { classMap, html, ifDefined } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';
import { GSStepStyle } from "./StepStyle.mjs";
import GSStepElement from './Step.mjs';

/**
 * Steps walker prev/next track current step and update step status
 * 
 * @class
 * @extends {Component}
 */
export default class GSStepsElement extends GSElement {

    static CSS = 'steps d-flex flex-wrap flex-sm-nowrap justify-content-between padding-top-2x padding-bottom-1x';

    #index = -1;

    constructor() {
        super();
    }

    shouldUpdate(changedProperties) { 
        return this.steps.length > 0;
    }

    renderUI() {
        const me = this;
        return html`<div class="${classMap(me.renderClass())}"  dir="${ifDefined(me.direction)}"><slot></slot></div>`;
    }

    renderClass() {
        return this.mapCSS(GSStepsElement.CSS, super.renderClass());
    }

    get steps() {
        return this.queryAll('gs-step');
    }

    get length() {
        return this.steps.length;
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
        const me = this;
        return me.steps[me.#index];
    }

    get isFirst() {
        return this.#index === 0;
    }

    get isLast() {
        return this.#index === this.length - 1;
    }

    next() {
        const me = this;
        if (me.steps.length === 0) return;
        if (me.isLast) return false;
        if (me.#index > - 1) me.current.color = GSStepElement.COMPLETED;
        me.index++;
        me.current.color = GSStepElement.SELECTED;
        return me.current;
    }

    previous() {
        const me = this;
        if (me.steps.length === 0) return;
        if (me.isFirst) return false;
        me.current.color = GSStepElement.INACTIVE;
        me.index--;
        me.current.color = GSStepElement.SELECTED;
        return me.current;
    }

    reset() {
        const me = this;
        me.steps.forEach(it => it.color = GSStepElement.INACTIVE);
        requestAnimationFrame(() => {
            me.#index = 0;
            me.current.color = GSStepElement.SELECTED;
        });
    }

    static {
        GSStepStyle.style;
        this.define('gs-steps', GSStepsElement);
    }

}