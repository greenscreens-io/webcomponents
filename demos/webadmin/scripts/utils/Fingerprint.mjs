/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Used to generate short temporary browser unique hash to improve Quark RPC API security.
 * NOTE: Not used to track user/browser
 */
export default class GSFinigerprint {
    
    static async fingerprint(all = false) {
        return {hash : 0, digest:'0'};
      }    
}