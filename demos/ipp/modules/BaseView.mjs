/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A BaseView class used by all other views
 * @module ipp/BaseView
 */
import { GSEvents, GSElement } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import Utils from './Utils.mjs';

export default class BaseView extends GSElement {

    onReady() {
        super.onReady();
        GSEvents.monitorAction(this);
    }

    onError(e) {
        Utils.handleError(e);
    }
    
}