/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSAlert class
 * @module components/GSAlert
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";

/**
 * https://getbootstrap.com/docs/5.1/components/buttons/
 * Process Bootstrap alert definition
 * <gs-alert css="btn-primary" css-active="fade" title="focus hover" dismissable="true"></gs-alert>
 * @class
 * @extends {GSElement}
 */
export default class GSAlert extends GSElement {

    #dismissCSS = '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    #state = false;

    static {
        customElements.define('gs-alert', GSAlert);
    }
    
    static get observedAttributes() {
        const attrs = ['css', 'title', 'active'];
        return  GSUtil.mergeArrays(attrs, super.observedAttributes);
    }

    constructor() {
        super();
	}  

    #onClick(e) {
        const me = this;
        GSUtil.sendEvent(me, 'action', {type:'alert', source: e}, true);
        me.dismiss();
    }

    onReady() {
        const me = this;
        const btn = me.findEl('.btn-close');
        me.attachEvent(btn, 'click', me.#onClick.bind(me));
        super.onReady();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const el = me.firstElementChild;

        if (name == 'title')  el.innerHTML = me.title;

        if (name == 'css') {
            GSUtil.toggleClass(el, false, oldValue);
            GSUtil.toggleClass(el, true, newValue);
        }

        if (name == 'active') GSUtil.toggleClass(el, !me.#state, activeCSS);
    }

    get template() {
        const me = this;        
        return `
        <div class="alert ${me.css}" role="class">
            <slot>${me.title}</slot>
            ${me.dismissible ? me.#dismissCSS : ''}
        </class>`;
    }

    get css() {
        const tmp = this.dismissible ? 'alert-dismissible fade show' : '';
        return GSUtil.getAttribute(this, 'css') + ` ${tmp}`; 
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css', val);
    }

    get activeCSS() {
        return GSUtil.getAttribute(this, 'css-active', 'd-none'); 
    }

    set activeCSS(val = '') {
        return GSUtil.getAttribute(this, 'css-active', val); 
    }

    get title() {
        return GSUtil.getAttribute(this, 'title'); 
    }

    set title(val='') {
        return GSUtil.setAttribute(this, 'title', val);
    }

    get dismissible() {
        return GSUtil.getAttributeAsBool(this, 'dismissible', false);
    }

    set dismissible(val = '') {
        return GSUtil.setAttribute(this, 'dismissible', GSUtil.asBool(val));
    }

    async #dismiss() {
        GSUtil.toggleClass(this.findEl('.alert'), false, 'show');
        await GSUtil.timeout(GSUtil.SPEED);
        return this.remove();
    }

    dismiss() {
        return this.#dismiss();
    }

    toggle() {
        this.active = !this.active;
    }

    /**
     * Prevent shadow dom
     */
     get isFlat() {
        return GSUtil.getAttributeAsBool(this, 'flat', true);
    }
    
    get position() {
        return 'self';
    }

}
