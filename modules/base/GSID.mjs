/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSID class
 * @module base/GSID
 */

/**
 * Generic unique ID generator for element
 * @class
 */
export class GSID {

	static #id = 0;

	/**
	 * Reset ID counter to 0
	 */
	static reset() {
		this.#id = 0;
	}

	/**
	 * Get next unique generated ID
	 * @param {*} prefx Value to prepend to ID counter
	 * @returns {String} A generated ID
	 */
	static next(prefx = 'GSId-') {
		return `${prefx}${++this.#id}`;
	}

	/**
	 * Auto generate next ID
	 * @returns {String} A generated ID
	 */
	static get id() {
		return this.next();
	}

	/**
	 * Calculate hashcode from string (Java compatible)
	 * @param {*} s A text fro mwhich hashcode is calculated 
	 * @returns {Number} Generated numeric hashcode
	 */
	static hashCode(s) {
		const l = (s || '').length;
		let h = 0, i = 0;
		if (l === 0) return h;
		while (i < l) {
			h = (h << 5) - h + s.charCodeAt(i++) | 0;
		}
		return h;
	}

	/**
	 * Set element id if not set already
	 * @param {HTMLElement} el 
	 */
	static setIf(el) {
		if (el) {
			el.id = typeof el.id !== 'string' ? GSID.id : el.id || GSID.id;
		}
	}

	static {
		Object.freeze(GSID);
	}

}

