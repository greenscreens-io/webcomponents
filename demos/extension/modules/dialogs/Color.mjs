/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import {BaseDialog} from './BaseDialog.mjs';
import { ColorController } from './ColorController.mjs';

export class Color extends BaseDialog {

    static {
        this.define('gs-color-dialog');
    }

    #controller = undefined;

    constructor() {
        super();
        const me = this;
        me.opened = false;        
        me.title = "Theme Colors";
        me.template = "//forms/color.html";
    }

    open(data) {
        const me = this;
	    me.#controller ??= new ColorController(me);
		super.open(data);
	}
   
}