/*
* Copyright (C) 2015, 2027 Green Screens Ltd.
*/

/**
 * A module loading GSBadge class
 * @module components/GSBadge
 */

import GSElement from "../base/GSElement.mjs";
import GSAttr from "../base/GSAttr.mjs";

/**
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSBadge extends GSElement {

    static {
        customElements.define('gs-badge', GSBadge);
        Object.seal(GSBadge);
    }

	static get observedAttributes() {
		return super.observedAttributes;
	}

    constructor() {
        super();
    } 

    onReady() {
        super.onReady();
        this.visible = false;
    }

    get template() {
        const me = this;
        const color = me.color ? `text-bg-${me.color}` : '';
        return `<span class="badge rounded-pill position-absolute top-0 end-0 translate-middle-y ${color} ">${me.value}</span>`;
    }

    get value() {
        return GSAttr.get(this, 'value', '!');
    }

    set value(val = '!') {
        return GSAttr.set('value', val);
    }

    get color() {
        return GSAttr.get(this, 'value', 'danger');
    }

    set color(val = '') {
        return GSAttr.get('value', val);
    }    
}

