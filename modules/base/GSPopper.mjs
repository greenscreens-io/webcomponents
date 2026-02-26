/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSPopper class
 * @module base/GSPopper
 */

import { GSLog } from "./GSLog.mjs";
import { GSCSSMap } from "./GSCSSMap.mjs";
import { GSDynamicStyle } from "./GSDynamicStyle.mjs";

/**
 * A generic set of static functions used across GS WebComponents framework
 * used for placing elements at fixed positions.
 * Also used to replace Bootstrap popper.
 * @class
 */
export class GSPopper {

	/**
	 * A simple wrapper to get element DOMRect
	 * @param {HTMLElement} el 
	 * @returns {DOMRect}
	 */
	static asRect(el) {
		return el.getBoundingClientRect();
	}

	/**
	 * Get element offset position
	 * Returns absolute position {left:0, top:0, width:0, height:0,centeY:0 centerX:0}
	 * @param {HTMLElement} el 
	 * @returns {Object} 
	 */
	static getOffset(el) {
		const rect = GSPopper.asRect(el);
		const sx = window.scrollX;
		const sy = window.scrollY;
		const obj = {
			left: rect.left + sx,
			right: rect.right + sx,
			top: rect.top + sy,
			bottom: rect.bottom + sy,
			height: rect.height,
			width: rect.width,
			x: rect.x + sx,
			y: rect.y + sy
		};
		obj.centerX = obj.left + (obj.width / 2);
		obj.centerY = obj.top + (obj.height / 2);
		return obj;
	}

	/**
	 * Return element position and size without padding
	 * Returned objext is the same format as native getBoundingRect
	 * @param {HTMLElement} element 
	 * @returns {Object} 
	 */
	static boundingRect(element, calcPadding) {

		const rect = GSPopper.asRect(element);
		const padding = GSPopper.elementPadding(calcPadding ? element : null);

		const paddingX = padding.x;
		const paddingY = padding.y;

		const elementWidth = element.clientWidth - paddingX;
		const elementHeight = element.clientHeight - paddingY;

		const elementX = rect.left + padding.left;
		const elementY = rect.top + padding.top;

		const centerX = (elementWidth / 2) + elementX;
		const centerY = elementY + (elementHeight / 2);

		return {
			width: elementWidth,
			height: elementHeight,
			top: elementY,
			left: elementX,
			x: elementX,
			y: elementY,
			centerX: centerX,
			centerY: centerY
		};
	}

	/**
	 * Calculate element padding
	 * @param {HTMLElement} element 
	 * @returns {Object}
	 */
	static elementPadding(element) {

		const obj = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			x: 0,
			y: 0
		};

		const isEl = element instanceof HTMLElement;
		if (!isEl) return obj;
		const css = GSCSSMap.getComputedStyledMap(element);

		obj.left = css.asNum('padding-left');
		obj.right = css.asNum('padding-right');
		obj.top = css.asNum('padding-top');
		obj.bottom = css.asNum('padding-bottom');
		obj.x = obj.left + obj.right;
		obj.y = obj.top + obj.bottom;

		return obj;
	}

	/**
	 * Fixed positioning on a viewport.
	 * @param {String} placement Location on target element top|bottom|left|right
	 * @param {HTMLElement} source Element to show
	 * @param {HTMLElement} target Element location at which to show
	 * @param {Boolean} arrow if true, will calculate arrow position
	 * @returns {void}
	 */
	static popupFixed(placement = 'top', source, target, arrow) {

		if (!(source && target)) return false;

		const pos = GSPopper.#fromPlacement(placement);

		if (!GSPopper.#isPlacementValid(pos)) {
			GSLog.warn(source, `Invalid popover position: ${placement}!`);
			return;
		}

		const style = GSDynamicStyle.dynamicStyle(source);
		if (!style) return;

		const css = {
			position: 'fixed',
			top: '0px',
			left: '0px',
			margin: '0px',
			padding: '0px',
			transform: '',
			translate: ''
		};

		Object.assign(style, css);

		const offh = source.clientHeight / 2;
		const offw = source.clientWidth / 2;

		const rect = GSPopper.boundingRect(target, arrow instanceof HTMLElement);
		const arect = GSPopper.#updateArrow(source, arrow, pos);

		const obj = {
			x: rect.centerX,
			y: rect.centerY,
			offH: offh,
			offW: offw,
			srcH: source.clientHeight,
			srcW: source.clientWidth
		}

		GSPopper.#calcFixed(pos, obj, rect, arect);
		style.translate = `${obj.x}px ${obj.y}px`;

	}

	/**
	 * Place element around target element. Bootstrap support for popup etc.
	 * @param {String} placement Location on target element top|bottom|left|right
	 * @param {HTMLElement} source Element to show
	 * @param {HTMLElement} target Element location at which to show
	 * @param {Boolean} arrow if true, will calculate arrow position
	 * @returns {void}
	 */
	static popupAbsolute(placement = 'top', source, target, arrow) {

		if (!(source && target)) return false;

		const pos = GSPopper.#fromPlacement(placement);

		if (!GSPopper.#isPlacementValid(pos)) {
			GSLog.warn(source, `Invalid popover position: ${placement}!`);
			return;
		}

		const style = GSDynamicStyle.dynamicStyle(source);
		const astyle = GSDynamicStyle.dynamicStyle(arrow);
		if (!style) return;
		
		const css = {
			inset: GSPopper.#inset(pos),
			position: 'absolute',
			margin: '0px',
			top: '0px',
			left: '0px',
			width: 'max-content',
			height: 'max-content',			
			transform: '',
			translate: ''
		};

		Object.assign(style, css);
		astyle.position = 'absolute';

		const srect = GSPopper.asRect(source);
		const arect = GSPopper.asRect(arrow);
		const offset = GSPopper.getOffset(target);

		const obj = {
			x: offset.centerX,
			y: offset.centerY
		}

		const arr = {
			x: (srect.width / 2) - (arect.width / 2),
			y: (srect.height / 2) - (arect.height / 2)
		}

		GSPopper.#calcAbsolute(pos, obj, arr, srect, arect, offset);

		const aopt = {
			translate: `${arr.x}px ${arr.y}px`,
			top: arr.top ? arr.top : '',
			left: arr.left ? arr.left : ''
		}

		const opt = {
			translate : `${obj.x}px ${obj.y}px`
		};

		Object.assign(style, opt);
		Object.assign(astyle, aopt);
	}

	static #calcAbsolute(pos, obj, arr, srect, arect, offset) {
		if (pos.isTop) {
			arr.y = 0;
			arr.left = '0px';
			obj.x = obj.x - (srect.width / 2);
			obj.y = -1 * (srect.bottom - offset.top + arect.height);
		} else if (pos.isBottom) {
			arr.y = 0;
			arr.left = '0px';
			obj.x = obj.x - (srect.width / 2);
			obj.y = offset.bottom + arect.height;
		} else if (pos.isStart) {
			arr.x = 0;
			arr.top = '0px';
			obj.x = -1 * (srect.right - offset.left + arect.width);
			obj.y = obj.y - (srect.height / 2);
		} else if (pos.isEnd) {
			arr.x = 0;
			arr.top = '0px';
			obj.x = offset.right + arect.width;
			obj.y = obj.y - (srect.height / 2);
		}
	}

	static #calcFixed(pos, obj, trect, arect) {
		if (pos.isTop) {
			obj.y = trect.top - obj.srcH - arect.size;
			obj.x = obj.x - obj.offW;
		} else if (pos.isBottom) {
			obj.y = trect.top + trect.height + arect.size;
			obj.x = obj.x - obj.offW;
		} else if (pos.isStart) {
			obj.x = trect.left - obj.srcW - arect.size;
			obj.y = obj.y - obj.offH + arect.size;
		} else if (pos.isEnd) {
			obj.x = trect.left + trect.width + arect.size;
			obj.y = obj.y - obj.offH + arect.size;
		}
	}

	static #inset(obj) {
		if (obj.isTop) {
			return 'auto auto 0px 0px';
		} else if (obj.isBottom) {
			return '0px auto auto 0px';
		} else if (obj.isStart) {
			return '0px 0px auto auto';
		} else if (obj.isEnd) {
			return '0px auto auto 0px';
		}
	}

	static #isPlacementValid(obj) {
		return obj.isStart || obj.isEnd || obj.isTop || obj.isBottom;
	}

	static #fromPlacement(placement) {
		return {
			isStart: placement == 'start' || placement == 'left',
			isEnd: placement == 'end' || placement == 'right',
			isTop: placement == 'top',
			isBottom: placement == 'bottom'
		}
	}

	static #updateArrow(element, arrow, pos) {

		if (!arrow) return { x: 0, y: 0, size: 0, width: 0, height: 0 };

		let shift = 0;
		const erect = GSPopper.boundingRect(element);
		const arect = GSPopper.boundingRect(arrow);

		const size = pos.isStart || pos.isEnd ? arect.width : arect.height;

		const arrowPosW = (erect.width / 2) - (size / 2);
		const arrowPosH = (erect.height / 2) - (size / 2);

		arect.size = size;

		const opt = {};

		opt.position = 'absolute';

		if (pos.isStart || pos.isEnd) {
			opt.left = '';
			opt.top = '0px';
			shift = 0; //pos.isStart ? size : -1 * size;
			opt.translate = `${shift}px ${arrowPosH / 2}px`;
		} else {
			opt.top = '';
			opt.left = '0px';
			shift = 0; //pos.isTop ? size : -1 * size;
			opt.translate = `${arrowPosW}px ${shift}px`;
		}

		GSDynamicStyle.applyDynamicStyle(arrow, opt);

		return arect;
	}

	static {
		Object.seal(GSPopper);
		globalThis.GSPopper = GSPopper;
	}
}


