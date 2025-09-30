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
     * Convert id to CSS class name .[name] or [name] if raw
     * @param {String} id 
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     * @returns 
     */
    #toName(id = '', raw = false) {
        return raw ? id : `.${id}`;
    }

	/**
	 * Remove dynamic element rule
	 * @param {String} id  
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
	 */
	deleteRule(id = '', raw = false) {
        const me = this;
        const name = me.#toName(id, raw);
		Array.from(me.cssRules)
			.map((v, i) => v.selectorText === name ? i : -1)
			.filter(v => v > -1)
			.forEach(v => super.deleteRule(v));
	}    

    /**
     * Get individual rule from dynamic styles cache
     * @param {String} id CSS class name
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     * @returns {CSSRule} 
     */
    getRule(id = '', raw = false) {
        const me = this;
        const name = me.#toName(id, raw);
        return Array.from(me.cssRules).filter(v => v.selectorText === name).pop();
    }

    /**
     * Set dynamic element rule. Accepts string or json object representation
     * @param {String} id Unique css class name used
     * @param {string|object} style CSS style properties to apply
     * @param {boolean} sync If true, applys rules immediately, otherwise on next animation frame
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     */
    setRule(id, style = '', sync = false, raw = false) {

        const me = this;

        if (!id) return;

		let rule = me.getRule(id, raw);
		if (!rule) {
            const name = me.#toName(id, raw);
			me.insertRule(`${name} {}`);
			return me.setRule(id, style, sync, raw);
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
		return root?.adoptedStyleSheets ?  Array.from(root?.adoptedStyleSheets).filter(el => el.id === id).pop() : null;
    }

	/**
	 * Find dynamic style & rule for element
	 * @param {HTMLElement} source A html element with dynamic style attached  (with data-gs-class attribute set)
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
	 * @returns {CSSStyleRule} Instance of dynamic css class 
	 */
	static dynamicRule(source, raw = false) {
		const style = GSDynamicStyle.dynamicStyleSheet(source);
		return style?.getRule(source.dataset.gsClass, raw);		
	}

    /**
     * Fnd custom dynamic rule
     * @param {Document} root Document or shadowDom
     * @param {String} id Dynamic CSS name
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     * @returns {CSSStyleRule} Instance of dynamic css class 
     */    
    static dynamicRuleByID(root, id, raw = false) {
        const style = GSDynamicStyle.dynamicStyleSheetByID(root, 'dynamic');
        return style?.getRule(id, raw);
    }

    /**
     * Find element dynamic style
     * @param {HTMLElement} source 
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     * @returns {CSSStyle} Element dynamic style or default style if dynamic not defined
     */
	static dynamicStyle(source, raw = false) {
		const rule = GSDynamicStyle.dynamicRule(source, raw);
		return rule?.style; // || source.style;
	}

    /**
     * Find element dynamic style
     * @param {Document} source Document or shadowDOM
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     * @returns {CSSStyle} Element dynamic style or default style if dynamic not defined
     */
	static dynamicStyleByID(root, id, raw = false) {
		const rule = GSDynamicStyle.dynamicRuleByID(root, id, raw);
		return rule?.style; // || source.style;
	}

    /**
     * Apply CSS properties to the element style.
     * Will search for a StyleSheet within element shadow addoptedStyleSheet by element data-gs-class property.
     * @param {HTMLElement} source Element with dynamic style attached (with data-gs-class attribute set)
     * @param {Object} opt A JSON object of css arguments to apply 
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     * @returns {CSSStyle} A copy of modifid CSSStyle object 
     */
	static applyDynamicStyle(source, opt, raw = false) {
        queueMicrotask(() => {
            const style = GSDynamicStyle.dynamicStyle(source, raw);
            return Object.assign(style, opt);
        });
	}
    
    /**
     * 
     * @param {Document || ShadowRoot} root Element with dynamic style attached
     * @param {String} id Dynamic CSS style name
     * @param {Object} opt A JSON object of css arguments to apply 
     * @param {boolean} raw If true, id is used as is, otherwise prefixed with '.'
     * @returns {CSSStyle} A copy of modifid CSSStyle object 
     */
	static applyDynamicStyleByID(root, id, opt, raw = false) {
        queueMicrotask(() => {
            const style = GSDynamicStyle.dynamicStyleByID(root, id, raw);
            return Object.assign(style, opt);
        });
	}     
}