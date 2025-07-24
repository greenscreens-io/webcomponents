/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */


import { GSUtil, GSDOM, GSFunction, GSEvents, GSDialogElement} from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";



/**
 * A module loading Utils class
 * @module Utils
 */

/**
 * Helper class with shared utility functions
 * @class
 */
export class Utils {

	static async clear() {
		await Utils.unsetUI('gs-admin-shell-login');
		await Utils.unsetUI('gs-admin-shell');
	}
		
    static setUI(value) {
		return GSEvents.waitAnimationFrame(()=> {			
	        const el = document.createElement(value);
	        document.body.insertAdjacentElement('beforeend', el);
			return el;
		});
    }

    static unsetUI(value) {
        return GSEvents.waitAnimationFrame(() => {
            const list = GSDOM.queryAll(value);
            list.forEach(el => el.remove());
        });
    }

    static get notify() {
		let notify = null;
		if (GSDialogElement.top) {
			notify = GSDialogElement.top.query('gs-notification', true);
			if (!notify) {
			 notify = GSDialogElement.opened
                .map(d => d.query?.('gs-notification', true))
                .filter(d => GSUtil.nonNull(d))
                .shift();
			}
		} 
        return notify || GSDOM.getByID('notification');
    }

    static get waiter() {
        return GSDOM.getByID('modal-waiter');
    }

    /**
     * Used by inherited dialogs to show notification on remote data fetch
     * 
     * @param {boolean} success Status message info/danger
     * @param {string} msg Message to show
     * @returns {boolean}
     */
    static inform(success = false, msg) {
        if (success) {
			Utils.notify?.info('Info', msg, false, 2, 0);
		} else {
        	Utils.notify?.danger('Error', msg, false, 2, 0);
		}
        return success;
    }

    static handleError(e) {	
        return Utils.handleResponse(e);
    }
    
    static handleResponse(obj) {
		console.log(obj);
		const success = Utils.responseStatus(obj);
        const txt = Utils.responseMessage(obj);
        if (txt) Utils.inform(success, txt, false, 2, 0);
		return success;
    }    

	static responseStatus(obj) {
		return (obj?.data?.success || obj?.success) == true;
	}

	static responseMessage(obj) {
		const msg = Utils.#toMessage(obj.data) || Utils.#toMessage(obj);
		return  msg || obj?.toString() || 'Unknown error!';
	}
	
	static #toMessage(obj) {
		return obj?.error || obj?.msg || obj?.message;
	}
		
    /**
     * Convert hex string to Uint8Array
     * @param {string} data 
     * @returns {Uint8Array}
     */
    static fromHex(data) {
        let a = [];
        for (let i = 0, len = data.length; i < len; i += 2) {
            a.push(parseInt(data.substring(i, 2), 16));
        }

        return new Uint8Array(a);
    }

    static toHex(data) {
        data = Utils.#validateData(data);
        return [...data].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Detect data and convert to Uint8Array
     * 
     * @param {variant}
     *            str
     */
    static #validateData(src) {
        var data = null;
        if (src instanceof Array) {
            data = new Uint8Array(src);
        } else if (src instanceof ArrayBuffer) {
            data = new Uint8Array(src);
        } else if (src instanceof Uint8Array) {
            data = src;
        } else if (src instanceof String || typeof src === 'string') {
            data = utf8ToBuffer(src);
        } else if (src.toArrayBuffer) {
            data = new Uint8Array(src.toArrayBuffer());
        } else {
            throw "Invalid input, must be String or ArrayBuffer or Uint8Array";
        }
        return data;
    }

    /**
     * Convert String to blob object
     * 
     * @param {String} val 
     * @return {Blob}
     */
    static stringToBlob(val) {
        return new Blob([val], {
            encoding: "UTF-8",
            type: "text/plain;charset=UTF-8"
        });
    }

    /**
     * Convert Binary to blob object
     * 
     * @param {String} val 
     * @return {Blob}
     */
    static binaryToBlob(val) {
        const data = Utils.#validateData(val);
        return new Blob([data], { type: 'application/octet-stream' });
    }

    /**
     * Download raw data 
     * @param {string} name 
     * @param {string|array} data 
     */
    static download(name, data) {
        if (!data) return false;
        const blob = GSUtil.isString(data) ? Utils.stringToBlob(data) : Utils.binaryToBlob(data);
        const link = URL.createObjectURL(blob);
        try {
            const a = document.createElement('a');
            a.download = name;
            a.href = link;
            a.click();
        } finally {
            setTimeout(() => URL.revokeObjectURL(link), 250);
        }
        return true;
    }

    static revokeObjectURL(url) {
        if (url?.indexOf('blob:') === 0) URL.revokeObjectURL(url)
    }

    static openInNewTab(url, params, target = '_blank') {

        const win = globalThis.open(url, target, params || null);

        if (GSFunction.isFunction(win.focus)) win.focus();

        win.addEventListener('beforeunload', () => {
            Utils.revokeObjectURL(url);
            return null;
        });

        return win;
    }
}