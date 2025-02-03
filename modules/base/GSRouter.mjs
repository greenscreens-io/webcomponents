/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSRouter class
 * @module base/GSRouter
 */

import { GSAttributeHandler } from "./GSAttributeHandler.mjs";
import { GSData } from "./GSData.mjs";
import { GSDOM } from "./GSDOM.mjs";
import { GSEvents } from "./GSEvents.mjs";
import { GSLoader } from "./GSLoader.mjs";
import { GSLog } from "./GSLog.mjs";
import { GSUtil } from "./GSUtil.mjs";

/**
 * Class for handling hash based routing.
 * Class uses GSAttributeHandler and optional JSON definition to handle routing.
 * 
 * Use globalThis.GS_ROUTER_URL before loading this module to define JSON definition file location
 * Use globalThis.GS_ROUTER_ENABLED to enable or disable routing on load
 * @Class
 */
export class GSRouter {

    // use GS_ROUTER_URL to define JSON definition file location
    static DEFINITION_URL = globalThis.GS_ROUTER_URL || '';
    static #definition = {};

    /**
     * Loda JSON definition for routing from JSON document.
     * @param {string} url 
     * @returns 
     */
    static async loadDefinition(url) {
        return GSLoader.load(url, 'GET', null, true);
    }

    /**
     * Initialize routing from provided URL
     * @param {*} url 
     */
    static async initialize(url) {
        url = url || GSRouter.DEFINITION_URL;
        if (GSUtil.isStringNonEmpty(url)) {
            GSRouter.#definition = await GSRouter.loadDefinition(url);
        }
        if (globalThis.GS_ROUTER_ENABLED) {
            GSRouter.enable();
        }
        await GSEvents.waitPageLoad(null, null, null, globalThis.GS_ROUTER_WAIT);
        GSRouter.#onHashChange();        
    }

    /**
     * Enable routing
     */
    static enable() {
        GSEvents.on(globalThis, null, 'hashchange', GSRouter.#onHashChange);
    }

    /**
     * Disable routing
     */
    static disable() {
        GSEvents.off(globalThis, null, 'hashchange', GSRouter.#onHashChange);
    }

    /**
     * Register a single route with options
     * @param {string} route Abstract url for a route
     * @param {Object} options 
     */
    static register(route, options) {
        GSRouter.#definition[route] = options;
    }

    /**
     * Unregister a single route
     * @param {string} route 
     */
    static unregister(route) {
        delete GSRouter.#definition[route];
    }

    /**
     * Get URL hashbang without hash
     */
    static get hash() {
        return location.hash.slice(1);
    }

    /**
     * Return routing definition object
     */
    static get definition() {
        return GSData.deepClone(GSRouter.#definition);
    }

    static #onHashChange() {
        const def = GSRouter.#definition[GSRouter.hash];
        if (def) {
            const el = GSDOM.fromJson(def);
            const px = GSAttributeHandler.proxify(el);
            GSAttributeHandler.process(px);
        } else {
            GSLog.warn(null, `No routing definition found for: ${GSRouter.hash}`);
        }
    }

    static {
        globalThis.GS_ROUTER_ENABLED = true;
        globalThis.GS_ROUTER_WAIT = 2000;
        GSRouter.initialize();        
    }

}
