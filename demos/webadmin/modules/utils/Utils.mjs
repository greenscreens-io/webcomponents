/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import { GSComponents, GSDOM, GSFunction, GSUtil, GSDialog } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

/**
 * A module loading Utils class
 * @module Utils
 */

/**
 * Helper class with shared utility functions
 * @class
 */
export default class Utils {

    static setUI(value) {
        return GSEvents.waitAnimationFrame(() => {
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
        if (GSDialog.top) {
            notify = GSDialog.top.notify;
            if (!notify) {
                const dlg = GSDialog.opened.filter(d => d.notify).shift();
                notify = dlg?.notify;
            }
        }
        return GSComponents.get('notification');
    }

    static get waiter() {
        return GSComponents.get('modal-waiter');
    }

    /**
     * Used by inherited dialogs to show notification on remote data fetch
     * 
     * @param {boolean} success Status message info/danger
     * @param {string} msg Message t oshow
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
        console.log(e);
        const msg = e.data?.error || e.msg || e.message || e.toString();
        Utils.inform(false, msg, false, 2, 0);
        return msg;
    }

    static handleResponse(msg) {
        const txt = (msg.message || msg)?.toString();
        if (txt) Utils.inform(msg.success === true, txt, false, 2, 0);
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