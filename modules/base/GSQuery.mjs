/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSSQuery class
 * @module base/GSSQuery
 */

import GSDOM from "./GSDOM.mjs";
import ProxyElement from "./ProxyElement.mjs";

/**
 * GSQuery is a helper for eaier DOM queries
 * @class
 */
export default class GSSQuery {

    static all(own, qry, all, shadow) {
        return ProxyElement.wrap(GSDOM.queryAll(own, qry, all, shadow));
    }

    static first(own, qry, all, shadow) {
        return ProxyElement.wrap(GSDOM.query(own, qry, all, shadow));
    }

    static {
        Object.freeze(GSSQuery);
        globalThis.GSSQuery = GSSQuery;
    }
}