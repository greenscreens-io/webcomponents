/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import GSDOM from '../../../../modules/base/GSDOM.mjs';
import GSLoader from '../../../../modules/base/GSLoader.mjs';
import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSDialog extends GSModal {

    constructor() {
        super();
        const me = this;
        me.cssHeader = 'p-3 dialog-title';
        me.cssTitle = 'fs-5 fw-bold';
        me.cssBody = 'p-0';
    }

    get dialogTemplate() {
        return '';
    }
    
    get dialogTitle() {
        return '';
    }

    async onReady() {
        super.onReady();
        const me = this;
        const tpl = await GSLoader.getTemplate(me.dialogTemplate);
        requestAnimationFrame(() => {         
            GSDOM.setHTML(me, tpl);
            me.title = me.dialogTitle;
            me.visible = true;
        });
    }
   
}