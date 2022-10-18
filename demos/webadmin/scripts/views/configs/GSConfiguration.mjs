/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSConfiguration extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-configuration', GSConfiguration);
        Object.seal(GSConfiguration);
    }

    async getTemplate() {
        return super.getTemplate('//views/configurations.html');
    }

    async onLoad(e) {
        const o = {success: false};
        return o.success ? o.data : false;
    }

    async onCreate(data) {
        return true;
    }

    async onUpdate(data) {
        return true;
    }

    async onRemove(data) {
        return true;
    }

    resetPrinter(e) {
        const data = e.detail.data;
        console.log('resetPrinter');
    }
    
    setupPrinter(e) {
        const data = e.detail.data;
        console.log('setupPrinter');
    }
    
    validateServer(e) {
        const data = e.detail.data;
        console.log('validateServer');
    }
}