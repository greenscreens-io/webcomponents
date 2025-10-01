/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import {BaseDialog} from './BaseDialog.mjs';

export class Color extends BaseDialog {

    static {
        this.define('gs-color-dialog');
    }

    constructor() {
        super();
        const me = this;
        me.opened = false;        
        me.title = "Theme Colors";
        me.template = "//forms/color.html";
    }

    async onData(data) {
        return true;
    }
    
}