/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from '../../../../modules/GSElement.mjs';

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