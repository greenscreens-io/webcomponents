/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSEventBus class
 * @module base/GSEventBus
 */

import GSEvent from './GSEvent.mjs';

/**
 * Class for handling shared events among components
 * @Class
 */
export default class GSEventBus  {

    static #registry = new Map();

    /**
     * Static event emiter. If named event does not exist, create a new one
     * 
     * @param {string} name EventBus name
     * @param {string} type Event name
     * @param {object} data Dat to send
     * 
     * @returns {boolean|object}
     */
    static send(name = '', type = '', data) {
        return GSEventBus.register(name).emit(type, data);
    }

    /**
     * Check if named event bus already exists
     * 
     * @param {string} name 
     * @returns {boolean}
     */
    static exist(name = '') {
        return name && GSEventBus.#registry.has(name);
    }

    /**
     * Register a named event bus. If already exists, will return existsing instance.
     * @param {string} name unique bus name
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
     * @param {string} name unique buss name
     * @returns {boolean} State of removal.
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