/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCustomization class
 * @module views/GSCustomization
 */
 import BaseViewUI from '../BaseViewUI.mjs';

 export default class GSCustomization extends BaseViewUI {
 
     static {
         customElements.define('gs-admin-view-customization', GSCustomization);
         Object.seal(GSCustomization);
     }
 
     async getTemplate() {
        return super.getTemplate('//views/customizations.html');
    }
 }