/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import {BaseDialog} from './BaseDialog.mjs';

export class Session extends BaseDialog {
    
    static {
        this.define('gs-session-dialog');
    }

    constructor() {
        super();
        const me = this;
        me.opened = false;
        me.title = "Terminal Session";
        me.template = "//forms/session.html";
    }

}