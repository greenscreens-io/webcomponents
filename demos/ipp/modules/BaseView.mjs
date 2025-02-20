/*
* Copyright (C) 2015, 2024 Green Screens Ltd.
*/

/**
 * A BaseView class used by all other views
 * @module ipp/BaseView
 */
import { GSEvents, GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

import { Utils } from './Utils.mjs';

export class BaseView extends GSElement {

    renderUI() {
        return this.renderTemplate();
    }

    firstUpdated() {
        super.firstUpdated();
        GSEvents.monitorAction(this);
    }

    onError(e) {
        Utils.handleError(e);
    }

}