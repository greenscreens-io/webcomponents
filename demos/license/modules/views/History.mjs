/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

/*
 * Class handling UI record history View
 */
export class History extends GSElement {

    constructor() {
        super();
        const me = this;
        me.template = "//views/history.html";
    }


    static {
        this.define('gs-view-history');
    }
}