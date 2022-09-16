/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSPrinting class
 * @module views/GSPrinting
 */
 import BaseViewUI from '../BaseViewUI.mjs';

 export default class GSPrinting extends BaseViewUI {
 
     static {
         customElements.define('gs-admin-view-printing', GSPrinting);
         Object.seal(GSPrinting);
     }

     async getTemplate() {
        return super.getTemplate('//views/printing.html');
    }
 
 }