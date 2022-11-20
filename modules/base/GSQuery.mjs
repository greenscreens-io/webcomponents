/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSSQuery function
 * @module base/GSDOM
 */

import GSDOM from "./GSDOM.mjs";
import ProxyElement from "./ProxyElement.mjs";

/**
 * GSQuery is a helper for eaier DOM queries
 * @class
 */
const GSSQuery = (own, qry, all, shadow) => {
    return ProxyElement.wrap(GSDOM.query(own, qry, all, shadow));
}

globalThis.GSSQuery = GSSQuery;
export default GSSQuery;