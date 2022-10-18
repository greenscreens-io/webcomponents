/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from "../../modules/base/GSUtil.mjs";

/**
 * A module loading BaseUI class
 * @module shell
 */


/**
 * Class representing Utils
 * @class
 * @extends {Utils}
 */
export default class Utils {

    static dataToBlob(data) {
        const blob = new Blob([data], { type: 'text/html' });
        return URL.createObjectURL(blob);
    }

    static releaseBlob(link) {
        if ((link || '').indexOf('blob:') === 0) {
            URL.revokeObjectURL(link);
        }
    }

    static async download(name = '', data) {
        const a = document.createElement("a");
        a.href = Utils.dataToBlob(data);
        a.download = name;
        a.click();
        await GSUtil.timeout(1000);
        Utils.releaseBlob(a.href);
    }

    static openInNewTab(url = '', data, params, target = '_blank') {
        const link = (url || '').length > 0 ? url : Utils.dataToBlob(data);
        const win = window.open(link, target, params || null);
        const isWin = win && typeof win.focus === 'function';
        if (!isWin) {
            Utils.releaseBlob(link);
            alert('Browser is blocking popup!');
            return;
        }
        win.addEventListener('beforeuload', () => Utils.releaseBlob(link));
    }

    static toHex(data, flat, space) {
        const tmp = [];
        Utils.wrap(data).forEach(v => {
            tmp.push(v.toString(16).padStart(2, 0));
        });
        return flat ? tmp.join(space || '') : tmp;
    }

    static fromHex(data, flat, space) {
        const tmp = [];
        Utils.wrap(data).forEach(v => {
            tmp.push(parseInt(v, 16));
        });
    }

    /**
     * Chewck if string is hex string
     * @param {String} data 
     */
    static isHexString(data) {

        if (GSUtil.isString(data)) {
            return (/^[0-9A-Fa-f]+$/g).test(data);
        } else {
            return false;
        }
    }

    /**
     * Split hex string to char pairs array
     */
    static splitHexString(data) {
        return data.match(/.{1,2}/g);
    }

    /**
     * Convert binary data as Uint8Array
     * 
     * @param {variant}
     *            data
     * @return {Uint8Array}
     */
    static wrap(data) {

        if (GSUtil.isString(data)) {
            if (Utils.isHexString(data)) {
                return Utils.splitHexString(data);
            } else {
                data = Utils.base64ToBuffer(data);
            }
        }

        if (!(data instanceof Uint8Array)) {
            data = new Uint8Array(data);
        }

        return data;
    }

    /**
     * Convert binary data as regular array
     * 
     * @param {variant}
     *            data
     * @return {Array}
     */
    static unwrap(data) {

        if (typeof data === 'string') {
            if (Utils.isHexString(data)) {
                return Utils.splitHexString(data);
            } else {
                data = Utils.base64ToBuffer(data);
            }
        }

        if (data instanceof Uint8Array) {
            data = Array.from(data);
        }

        return data;
    }

	/**
	 * Convert base64 text to binary data
	 * 
	 * @param {String}
	 *            base64
	 */
     static base64ToBuffer(base64) {
        const binary_string = globalThis.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }    
}