/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAlert class
 * @module components/GSAlert
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSAttr from "../base/GSAttr.mjs";

/**
 * https://getbootstrap.com/docs/5.1/components/buttons/
 * Process Bootstrap alert definition
 * <gs-alert css="btn-primary" css-active="fade" message="focus hover" dismissable="true"></gs-alert>
 * @class
 * @extends {GSElement}
 */
export default class GSCopyright extends GSElement {

    #css = 'fixed-bottom d-flex justify-content-center align-items-center mt-1 p-2 text-muted';

    static {
        customElements.define('gs-copyright', GSCopyright);
        Object.seal(GSCopyright);
    }

    constructor() {
        super();
    }

    get template() {
        const me = this;
        GSUtil.isStringEmpty(me.company)
        if (!(me.isCompany && me.isYear)) return '';
        const year = new Date().getFullYear();
        return `
        <div class="${me.css}">
            <small>&copy; ${me.company} ${me.year}. - ${year}.</small>
        </div>`;
    }

    get css() {
        return GSAttr.get(this, 'css', this.#css);
    }

    get company() {
        return GSAttr.get(this, 'company', '');
    }

    get isCompany() {
        return GSUtil.isStringNonEmpty(this.company);
    }
        
    get isYear() {
        return GSUtil.isStringNonEmpty(this.year);
    }

    get year() {
        return GSAttr.get(this, 'year', '');
    }

    get isFlat() {
        return true;
    }

    get anchor() {
        return 'self';
    }

}

