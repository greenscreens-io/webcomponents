/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from '../../../../modules/GSElement.mjs';

/*
 * Class handling UI licences records View
 */
export class Licences extends GSElement {

    constructor() {
        super();
        const me = this;
        me.template = "//views/licences.html";
    }

    static {
        this.define('gs-view-licences');
    }
}