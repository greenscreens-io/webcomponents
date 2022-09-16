/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSScheduler class
 * @module views/GSScheduler
 */
 import BaseViewUI from '../BaseViewUI.mjs';

 export default class GSScheduler extends BaseViewUI {
 
     static {
         customElements.define('gs-admin-view-scheduler', GSScheduler);
         Object.seal(GSScheduler);
     }
 
     async getTemplate() {
        return super.getTemplate('//views/schedulers.html');
    }
 }