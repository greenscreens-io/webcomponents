/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSPrinterReset class
 * @module dialogs/GSPrinterReset
 */
 import GSDialog from './GSDialog.mjs';

 export default class GSPrinterReset extends GSDialog {
 
     static {
         customElements.define('gs-admin-dialog-printer-reset', GSPrinterReset);
         Object.seal(GSPrinterReset);
     }
 
     #data = null;
 
     get dialogTemplate() {
         return '//dialogs/printer-reset.html';
     }
 
     get dialogTitle() {
         return 'Printer Reset';
     }
 
     open(data) {
         const me = this;
         me.#data = Object.assign({}, data);
         me.#data.host = me.#data.name;
         super.open();
     }
 
     async onOpen() {
         return this.#data;
     }
 
     async onData(data) {
         const me = this;
         me.waiter.open();
         let success = false;
         try {
             me.visible = false;
             const o = DEMO ? DEMO : await io.greenscreens.Printer.reset(data);
             success = o.success;
         } catch(e) {
             me.visible = true;
             throw e;            
         } finally {
             me.waiter.close();
         }
         return success;
     }    
 
 }