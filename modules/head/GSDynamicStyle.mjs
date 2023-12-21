/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import GSBase from "./GSBase.mjs";

export default class GSDynamicStyle extends CSSStyleSheet {

    constructor(id) {
        super();
        this.id = id || GSBase.nextID();
    }

	/**
	 * Remove dynamic element rule
	 * @param {string} id  
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
     * @param {string} id 
     * @returns {CSSRule}
     */
    getRule(id = '') {
        return Array.from(this.cssRules).filter(v => v.selectorText === `.${id}`).pop();
    }

    /**
     * Set dynamic element rule. Accepts string or json object representation
     * @param {string} id 
     * @param {string|object} style 
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
        style = style || '';
        const isImportant = style.includes('!important');
        style = style.replace('!important', '');
        prop = prop.trim();
        rule.style.setProperty(prop, style, isImportant ? 'important' : '');
    }
}