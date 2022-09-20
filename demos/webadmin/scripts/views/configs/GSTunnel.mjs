/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
 import BaseViewUI from '../BaseViewUI.mjs';

 export default class GSTunnel extends BaseViewUI {
 
     static {
         customElements.define('gs-admin-view-tunnel', GSTunnel);
         Object.seal(GSTunnel);
     }
 
     async getTemplate() {
        return super.getTemplate('//views/tunnel.html');
    }

 }