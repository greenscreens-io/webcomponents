/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import { GSEvents } from "./GSEvents.mjs";
import { GSUtil } from "./GSUtil.mjs";


/**
 * A module loading GSAbortController class
 * @module base/GSAbortController
 */

/**
 * Extend native AbortController with timeout 
 * @class
 */
export class GSAbortController extends AbortController {

    #iid = 0;

    constructor(timeout = 0) {
        super();
        if (!GSUtil.isNumber(timeout)) throw new Error('Timeout parameter must be number');
        const me = this;
        if (timeout) me.#iid = setTimeout(me.abort.bind(me), timeout);
        me.signal.addEventListener('abort', () => clearInterval(me.#iid));
    }

    wait(timeout = 0) {
        return GSEvents.wait(me.signal, 'abort', timeout);
    }
}