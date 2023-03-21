/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSWizard class
 * @module components/GSWizard
 */

import GSElement from "../../base/GSElement.mjs";
import GSItem from "../../base/GSItem.mjs";
import GSSteps from "./GSSteps.mjs";

/**
 * Steps walker prev/next track current step and update step status
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSWizard extends GSSteps {

    static {
        customElements.define('gs-wizard', GSWizard);
        Object.seal(GSWizard);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    next() {
        const me = this;
        if (!super.next()) return false;
        me.#replacePanel();
        return me.current;
    }

    previous() {
        const me = this;
        if (super.previous()) return false;
        me.#replacePanel();
        return me.current;
    }

    reset() {
        super.reset();
        const me = this;
        me.#replacePanel();
    }

    async getTemplate(val = '') {
        const me = this;
        const items = GSItem.genericItems(me);
        const steps = await super.getTemplate(val);
        const css = '';
        const cssBody = '';
        const cssFoot = '';
        const body = me.#renderPanel(items[me.index]);
        return `<div class="wizard ${css}">
            ${steps}
            <form>
                <div class="wizard-body ${cssBody}">
                ${body}
                </div>
            </form>
            <div class="wizard-footer ${cssFoot}">
             <!-- buttons confirm(prev/next) cancel -->
            </div>            
        </div>`;
    }

    #renderPanel(el) {
        return ``;
    }
  
    #replacePanel() {
        const me = this;
        const items = GSItem.genericItems(me);
        const body = me.#renderPanel(items[me.index]);
        me.#body.innerHTML = body;
    }

    get #body() {
        return this.query('.wizard-body');
    }

    get #form() {
        return this.query('form');
    }
}