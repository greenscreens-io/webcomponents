/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSEventBus class
 * @module base/GSEventBus
 */

import { GSEvent } from './GSEvent.mjs';

/**
 * Class for handling shared events among components
 * Difference from native BroadcastChannel is :
 *  - support for multiple named events
 *  - does not work across different pages
 * @Class
 */
export class GSEventBus {

    static #registry = new Map();

    /**
     * Static event emiter. If named event does not exist, create a new one
     * 
     * @param {String} name EventBus name
     * @param {String} type Event name
     * @param {Object} data Dat to send
     * 
     * @returns {boolean|object}
     */
    static send(name = '', type = '', data) {
        return GSEventBus.register(name).emit(type, data);
    }

    /**
     * Check if named event bus already exists
     * 
     * @param {String} name 
     * @returns {Boolean}
     */
    static exist(name = '') {
        return name && GSEventBus.#registry.has(name);
    }

    /**
     * Register a named event bus. If already exists, will return existsing instance.
     * @param {String} name unique bus name
     * @returns {GSEventBus}
     */
    static register(name = '') {
        if (!GSEventBus.exist(name)) {
            GSEventBus.#registry.set(name, new GSEvent());
        }
        return GSEventBus.#registry.get(name);
    }

    /**
     * Unregister named event bus from registry.
     * @param {String} name unique buss name
     * @returns {Boolean} State of removal.
     */
    static unregister(name = '') {
        const bus = GSEventBus.#registry.get(name);
        if (bus?.unbind) bus.unbind();
        return GSEventBus.#registry.delete(name);
    }

    static {
        Object.freeze(GSEventBus);
        globalThis.GSEventBus = GSEventBus;
    }
}