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

    #owner = null;
    #logging = true;
    #enabled = false;
    #hashCallback = null;
    #cache = null;
    #definition = {};

    constructor(owner) {
        const me = this;
        me.#owner = owner;
        me.#cache ??= new Map();
        me.#hashCallback = me.#onHashChange.bind(me);
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
    async initialize(url, wait = 0) {
        const me = this;
        me.#cache.clear();        
        if (GSUtil.isStringNonEmpty(url)) {
            me.#definition = await me.loadDefinition(url);
        }
        if (wait > 0) {
            await GSEvents.waitPageLoad(null, null, null, wait);
        }
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

    #onHashChange(e) {
        const me = this;
        const hash = me.hash;
        let px = me.#cache.get(hash);
        if (!px) {   
            px = me.#proxify();         
            if (px) me.#cache.set(hash, px);
        }
        // 1. 31.07.2025.
        // GSAttributeHandler.process(px);
        px?.handle(e);
    }

    #proxify() {
        let px = undefined;
        const me = this;
        const hash = me.hash;
        const def = me.#definition["#def"] || {};
        const defaults = me.#definition["#defaults"] || {};
        const route = me.#definition[hash];
        if (route) {
            const el = GSDOM.fromJson(Object.assign({}, route, def, defaults));
            el.dataset.gsHashed = true;
            // 1. 31.07.2025.
            //px = GSAttributeHandler.proxify(el);
            px = new GSAttributeHandler(el, me.#owner);
        } else if (me.#logging) {
            GSLog.warn(null, `No routing definition found for: ${hash}`);
        }
        return px;
    }

    static {
        if (globalThis.GS_DEFINITION_URL) {
            new GSRouter().initialize(globalThis.GS_DEFINITION_URL, globalThis.GS_ROUTER_WAIT);
        }
    }

}
