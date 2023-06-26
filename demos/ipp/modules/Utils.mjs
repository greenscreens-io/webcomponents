/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import { GSComponents } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

/**
 * A module loading Utils class
 * @module Utils
 */

/**
 * Helper class with shared utility functions
 * @class
 */
export default class Utils {

    static get notify() {
        return GSComponents.get('notification');
    }

    /**
     * Used by inherited dialogs to show notification on remote data fetch
     * 
     * @param {boolean} success Status message info/danger
     * @param {string} msg Message t oshow
     * @returns {boolean}
     */
    static inform(success = false, msg) {
        if (!Utils.notify) return;
        if (success) return Utils.notify.info('Info', msg);
        Utils.notify.danger('Error', msg);
        return success;
    }

    static handleError(e) {
        console.log(e);
        const msg = e.data?.error || e.msg || e.message || e.toString();
        Utils.inform(false, msg);
        return msg;
    }

    static async load(url = '') {
        const res = await fetch(url);
        return await res.json();
    }
}