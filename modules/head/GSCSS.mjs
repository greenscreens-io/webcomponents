/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * A module loading GSCSS class
 * @module head/GSCSS
 */

/**
 * Adoptable CSS - css template for WebComponents
 */
import GSBase from "./GSBase.mjs";
import GSCacheStyles from "./GSCacheStyles.mjs";

/**
 * WebComponents shared CSS
 * 
 * To change theme use hashtag (auto=true retured and theme=THEME_NAME)
 * http://localhost:8080/demos/button.html#theme=bs
 * 
 * <gs-css auto="true" global="true" url="/assets/css/custom.css" rel="stylesheet"></gs-css>
 * <gs-css auto="true" global="true" url="/assets/css/bootstrap_5.2.0.css" rel="stylesheet" disabled="true" theme="bs"></gs-css>
 * 
 * Use attribute disabled to disable theme programatically
 * @class
 * @extends head/GSBase
 */
export default class GSCSS extends GSBase {

	static get observedAttributes() {
        return  ['disabled'].concat(super.observedAttributes);
    }

	attributeCallback(name, oldValue, newValue) {
		const me = this;
		if(name !== 'disabled') return;
		return me.isDisabled ? me.dispose() : me.render();
	}

	constructor() {
		super();
		const me = this;
		me.disabled = me.notheme == false && me.theme !== GSCSS.activeTheme;
		//me.disabled = !(me.theme === 'default' || me.theme === GSCSS.activeTheme);
	}

	/**
	 * Load, initialize and cache stylesheet for sharing among WebComponents
	 */
	async render() {
		const me = this;
		if (me.isDisabled) return;
		if (!me.order) me.order = GSBase.nextID();
		//const hash = GSBase.hashCode(me.url);
		try {
			const res = await fetch(me.url);
			if (!res.ok) return;
			const css = await res.text();
			GSCacheStyles.injectStyle(css, me.isGlobal, me.order);
			const sheet = GSCacheStyles.get(me.order);
			if (sheet) GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
		} catch (e) {
			GSCacheStyles.remove(me.order);
			console.log(e);
		}

	}

	dispose() {
		const me = this;
		if (!me.isAuto) return;
		const sheet = GSCacheStyles.get(me.order);
		GSCacheStyles.remove(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
		if (me.isGlobal) document.adoptedStyleSheets = GSCacheStyles.styles;
	}

	/**
	 * If set to true, stylsheet is added to document
	 * @returns {boolean} Defeault to true
	 */	
	get isGlobal() {
		return this.getAttribute('global') == 'true';
	}

	/**
	 * Sortable value, order in stylecache list
	 * @returns {boolean}
	 */		
	get order() {
		return this.getAttribute('order');
	}

	set order(val = '') {
		return this.setAttribute('order', val);
	}

	/**
	 * If set to true, theme switcher will ignore this style (considered mandatory)
	 * @returns {boolean} Default to false
	 */	
	get notheme() {
		return this.getAttribute('notheme') === 'true';
	}

	/**
	 * Disable this style 
	 * @returns {boolean}
	 */		
	get disabled() {
		return this.getAttribute('disabled');
	}

	set disabled(val = '') {
		return this.setAttribute('disabled', '' + val == 'true');
	}

	/**
	 * Check if style is disabled
	 * @returns {boolean}
	 */		
	get isDisabled() {
		return this.disabled === 'true';
	}

	/**
	 * Theme name used for theme switcher
	 * @returns {string}
	 */
	get theme() {
		return this.getAttribute('theme') || 'default';
	}

	/**
	 * Extract currently used style theme
	 * @returns {string}
	 */
	static get activeTheme() {
		const sp = new URLSearchParams(location.hash.slice(1));
		return sp.get('theme') || 'default';		
	}

	static #onTheme(e) {
		const theme = GSCSS.activeTheme;		
		Array.from(document.querySelectorAll('gs-css'))
		.filter(el => el.notheme == false)
		.forEach(el => el.disabled = el.theme !== theme);
	}

	static {
		Object.freeze(GSCSS);
		customElements.define('gs-css', GSCSS);
		window.addEventListener('hashchange', GSCSS.#onTheme, false);
	}

}
