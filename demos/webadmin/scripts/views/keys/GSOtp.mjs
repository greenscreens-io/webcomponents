/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSOtp class
 * @module views/GSOtp
 */
 import BaseViewUI from '../BaseViewUI.mjs';

 export default class GSOtp extends BaseViewUI {
 
     static {
         customElements.define('gs-admin-view-otp', GSOtp);
         Object.seal(GSOtp);
     }
 
     async getTemplate() {
        return super.getTemplate('//views/keys-otp.html');
    }

 }