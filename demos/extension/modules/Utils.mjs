/*
 * Copyright (C) 2015, 2026 Green Screens Ltd.
 */

import { GSDOM } from '../../../modules/base/GSDOM.mjs';
import { GSEvents } from '../../../modules/base/GSEvents.mjs';

import { GSUtil } from '../../../modules/base/GSUtil.mjs';
import { GSDialogElement } from '../../../modules/components/Dialog.mjs';

/**
 * A module loading Utils class
 * @module Utils
 */

/**
 * Helper class with shared utility functions
 * @class
 */
export class Utils {

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
		
}