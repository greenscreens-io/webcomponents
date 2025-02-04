/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSRouter class
 * @module base/GSRouter
 */

import { GSLog } from "./GSLog.mjs";
import { GSUtil } from "./GSUtil.mjs";
import { GSData } from "./GSData.mjs";
import { GSDOM } from "./GSDOM.mjs";
import { GSEvents } from "./GSEvents.mjs";
import { GSLoader } from "./GSLoader.mjs";
import { GSAttributeHandler } from "./GSAttributeHandler.mjs";

/**
 * Class for handling hash based routing.
 * Class uses GSAttributeHandler and optional JSON definition to handle routing.
 * 
 * Use globalThis.GS_ROUTER_URL before loading this module to define JSON definition file location
 * @Class
 */
export class GSRouter {

    #logging = true;
    #enabled = false;
    #hashCallback = null;
    #definition = {};

    constructor() {
        this.#hashCallback = this.#onHashChange.bind(this);
    }

    /**
     * Loda JSON definition for routing from JSON document.
     * @param {string} url 
     * @returns 
     */
    async loadDefinition(url) {
        return GSLoader.getRouter(url);
    }

    /**
     * Initialize routing from provided URL
     * @param {string} url 
     * @param {number} wait in ms
     */
    async initialize(url, wait = 2000) {
        const me = this;
        if (GSUtil.isStringNonEmpty(url)) {
            me.#definition = await me.loadDefinition(url);
        }
        await GSEvents.waitPageLoad(null, null, null, wait);
        me.enable();
        me.#onHashChange();        
    }

    /**
     * Enable routing
     */
    enable() {
        if (this.#enabled) return;
        GSEvents.on(globalThis, null, 'hashchange', this.#hashCallback);
        this.#enabled = true;
    }

    /**
     * Disable routing
     */
    disable() {
        GSEvents.off(globalThis, null, 'hashchange', this.#hashCallback);
        this.#enabled = false;
    }

    /**
     * Register a single route with options
     * @param {string} route Abstract url for a route
     * @param {Object} options 
     */
    register(route, options) {
        this.#definition[route] = options;
    }

    /**
     * Unregister a single route
     * @param {string} route 
     */
    unregister(route) {
        delete this.#definition[route];
    }

    /**
     * Get URL hashbang without hash
     */
    get hash() {
        return location.hash.slice(1);
    }

    /**
     * Return routing definition object
     */
    get definition() {
        return GSData.deepClone(this.#definition);
    }

    get log() {
        return this.#logging;
    }

    set log(val) {
        this.#logging = GSUtil.asBool(val);
    }

    #onHashChange() {
        const me = this;
        const def = me.#definition["#def"] || {};
        const defaults = me.#definition["#defaults"] || {};
        const route = me.#definition[me.hash];
        if (route) {
            const el = GSDOM.fromJson(Object.assign({}, route, def, defaults));
            el.dataset.gsHashed = true;
            const px = GSAttributeHandler.proxify(el);
            GSAttributeHandler.process(px);
        } else if (me.#logging) {
            GSLog.warn(null, `No routing definition found for: ${me.hash}`);
        }
    }

    static {
        const wait = globalThis.GS_ROUTER_WAIT || 2000;
        if (globalThis.GS_DEFINITION_URL) {
            new GSRouter().initialize(globalThis.GS_DEFINITION_URL, wait);
        }
    }

}
