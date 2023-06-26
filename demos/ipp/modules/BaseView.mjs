/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A BaseView class used by all other views
 * @module ipp/BaseView
 */
import { GSUtil, GSFunction, GSElement } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import Utils from './Utils.mjs';

export default class BaseView extends GSElement {

    onReady() {
        super.onReady();
        const me = this;
        me.on('action', me.#onAction.bind(me));
    }

    async #onAction(e) {
        const me = this;
        if (!e.detail.action) return;
        try {
            const action = GSUtil.capitalizeAttr(e.detail.action);
            const fn = me[action];
            if (GSFunction.isFunction(fn)) {
                if (GSFunction.isFunctionAsync(fn)) {
                    await me[action](e);
                } else {
                    me[action](e);
                }
            }
        } catch (e) {
            Utils.handleError(e);
        }
    }

}