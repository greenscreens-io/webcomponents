/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSID class
 * @module base/GSID
 */

/**
 * Generic unique ID generator for element
 * @class
 */
export default class GSID {

 	static #id = 0;

	/**
	 * Reset ID counter to 0
	 */
 	static reset() {
 		this.#id  = 0;
 	}

	/**
	 * Get next unique generated ID
	 * @param {*} prefx Value to prepend to ID counter
	 * @returns {string} A generated ID
	 */
 	static next(prefx = 'GSId-') {
 		return `${prefx}${this.#id++}`;
 	}

	/**
	 * Auto cenerate next ID
	 * @returns {string} A generated ID
	 */
 	static get id() {
 		return this.next();
 	}

	/**
	 * Calcualte hashcode from string (Java compatible)
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
	};

	static {
		Object.freeze(GSID);
	}
	
 }
 