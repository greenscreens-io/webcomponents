/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */
import { GSDOM } from "./GSDOM.mjs";
import { GSID } from "./GSID.mjs";

/**
 * A dynamic CSSStyleSheet used for dynamic programmable changed
 * css classes attached to a WebComponent html template elements.
 * Programmatically changing dynamic class elements will not reflect 
 * element style properties.
 */
export class GSDynamicStyle extends CSSStyleSheet {

    /**
     * Constructor for DynamicStlye
     * @param {String} id Unique name for easier filtering  
     */
    constructor(id = 'dynamic') {
        super();
        this.id = id || GSID.id;
    }

	/**
	 * Remove dynamic element rule
	 * @param {String} id  
	 */
	deleteRule(id = '') {
        const me = this;
		Array.from(me.cssRules)
			.map((v, i) => v.selectorText === `.${id}` ? i : -1)
			.filter(v => v > -1)
			.forEach(v => me.deleteRule(v));
	}    

    /**
     * Get individual rule from dynamic styles cache
     * @param {String} id CSS class name
     * @returns {CSSRule} 
     */
    getRule(id = '') {
        return Array.from(this.cssRules).filter(v => v.selectorText === `.${id}`).pop();
    }

    /**
     * Set dynamic element rule. Accepts string or json object representation
     * @param {String} id Unique css class name used
     * @param {string|object} style CSS style properties to apply
     */
    setRule(id, style = '', sync = false) {

        const me = this;

        if (!id) return;

		let rule = me.getRule(id);
		if (!rule) {
			me.insertRule(`.${id} {}`);
			return me.setRule(id, style, sync);
		}        

        if (!style) return rule;

        let data = [];
        if (typeof style === 'string') {
            data = style.replaceAll('\n', '').split(';').map(v => v.trim().split(':')).filter(v => v.length === 2);
        } else {
            data = Object.entries(style);
        }

        if (sync) {
            data.forEach(kv => me.#updateRule(rule, kv[0], kv[1]));
        } else {
            requestAnimationFrame(() => {
                data.forEach(kv => me.#updateRule(rule, kv[0], kv[1]));
            });
        }

        return rule;
    }

    #updateRule(rule, prop = '', style = '') {
        style = (style || '').toString();
        const isImportant = style.includes('!important');
        style = style.replace('!important', '');
        prop = prop.trim();
        rule.style.setProperty(prop, style, isImportant ? 'important' : '');
    }

    /**
     * Find element dynamic style attached. 
     * Will search for a StyleSheet within element shadow addoptedStyleSheet by element data-sheet property.
     * @param {HTMLElement} source A html element continaing dynamically injected html style
     * @returns {CSSStyleSheet} An instance of dynamic stylesheet containing dynamic rules
     */
	static dynamicStyleSheet(source) {
		// find shadow root (or document)
		const root = GSDOM.root(source);
        const id = source.dataset.sheet || 'dynamic';
		// find custom; dynamic style
		return GSDynamicStyle.dynamicStyleSheetByID(root, id);
	}

    /**
     * Fnd custom dynamic style
     * @param {Document} root Document or shadowDom
     * @param {String} id Dynamic CSS name
     * @returns {CSSStyleSheet} An instance of dynamic stylesheet containing dynamic rules
     */
    static dynamicStyleSheetByID(root, id) {
		return Array.from(root?.adoptedStyleSheets).filter(el => el.id === id).pop();
    }

	/**
	 * Find dynamic style & rule for element
	 * @param {HTMLElement} source A html element with dynamic style attached  (with data-gs-class attribute set)
	 * @returns {CSSStyleRule} Instance of dynamic css class 
	 */
	static dynamicRule(source) {
		const style = GSDynamicStyle.dynamicStyleSheet(source);
		return style?.getRule(source.dataset.gsClass);		
	}

    /**
     * Fnd custom dynamic rule
     * @param {Document} root Document or shadowDom
     * @param {String} id Dynamic CSS name
    * @returns {CSSStyleRule} Instance of dynamic css class 
     */    
    static dynamicRuleByID(root, id) {
        const style = GSDynamicStyle.dynamicStyleSheetByID(root, 'dynamic');
        return style?.getRule(id);
    }

    /**
     * Find element dynamic style
     * @param {HTMLElement} source 
     * @returns {CSSStyle} Element dynamic style or default style if dynamic not defined
     */
	static dynamicStyle(source) {
		const rule = GSDynamicStyle.dynamicRule(source);
		return rule?.style; // || source.style;
	}

    /**
     * Find element dynamic style
     * @param {Document} source Document or shadowDOM
     * @returns {CSSStyle} Element dynamic style or default style if dynamic not defined
     */
	static dynamicStyleByID(root, id) {
		const rule = GSDynamicStyle.dynamicRuleByID(root, id);
		return rule?.style; // || source.style;
	}

    /**
     * Apply CSS properties to the element style.
     * Will search for a StyleSheet within element shadow addoptedStyleSheet by element data-gs-class property.
     * @param {HTMLElement} source Element with dynamic style attached (with data-gs-class attribute set)
     * @param {Object} opt A JSON object of css arguments to apply 
     * @returns {CSSStyle} A copy of modifid CSSStyle object 
     */
	static applyDynamicStyle(source, opt) {
        requestAnimationFrame(() => {
            const style = GSDynamicStyle.dynamicStyle(source);
            return Object.assign(style, opt);
        });
	}
    
    /**
     * 
     * @param {Document || ShadowRoot} root Element with dynamic style attached
     * @param {String} id Dynamic CSS style name
     * @param {Object} opt A JSON object of css arguments to apply 
     * @returns {CSSStyle} A copy of modifid CSSStyle object 
     */
	static applyDynamicStyleByID(root, id, opt) {
        requestAnimationFrame(() => {
            const style = GSDynamicStyle.dynamicStyleByID(root, id);
            return Object.assign(style, opt);
        });
	}     
}