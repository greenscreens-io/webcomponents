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

 }