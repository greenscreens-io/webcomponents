/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSLog } from '../base/GSLog.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSFunction } from '../base/GSFunction.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSElement } from '../GSElement.mjs';
import { numGT0 } from '../properties/verificator.mjs';
import { GSReadWriteRegistry } from '../data/ReadWriteRegistry.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSData } from '../base/GSData.mjs';

/**
 * A module loading GSDataHandler class
 * @module components/GSDataHandler
 */

/**
 * GUI element for easier access to the GSReadWrite/GSTreeReader
 * @class
 * @extends {GSElement}
 */
export class GSDataHandler extends GSElement {

    static properties = {
        storage: { state: true },
        src: { reflect: true },
        action: { reflect: true },
        mode: { reflect: true },
        reader: { reflect: true },
        writer: { reflect: true },
        limit: { type: Number, reflect: true },
        skip: { type: Number, reflect: true },
        filter: { type: Array, reflect: true },
        sort: { type: Array, reflect: true },
        type: {},
        autoload: { type: Boolean },
        autorefresh: { type: Number, reflect: true, hasChanged: numGT0 },
    }

    #iid = 0;
    #config = null;
    #handler = null;
    #lifoReadRef = null;

    constructor() {
        super();
        const me = this;
        if (!me.id) throw new Error('Element ID is required attribute!');
        GSItem.validate(me, me.tagName);
        me.autorefresh = true;
        me.autoload = false;
        me.flat = true;
        me.filter = [];
        me.sort = [];
        me.limit = 0;
        me.skip = 0;
        me.type = 'remote';
        me.mode = 'query';
        me.reader = 'GET';
        me.writer = 'POST';
        me.storage = me.id;
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.#initLIFO();
        me.#config = GSItem.proxify(me, GSData.PROPERTIES);
        me.#handler = GSReadWriteRegistry.newHandler(me.type, me.id, false);
        if (me.#config?.length > 0) me.#handler?.addProcessor(me);
        me.#handler?.enable();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#handler?.disable();
        this.#handler?.removeProcessor(this);
        this.#lifoReadRef = null;
        clearTimeout(this.#iid);
    }

    willUpdate(changed) {
        super.willUpdate(changed);
        const me = this;
        me.#updateHandler();
        if (changed.has('autorefresh')) me.schedule(me.autorefresh);
    }

    #updateHandler() {
        const me = this;
        if (!me.#handler) return;

        me.#handler.src = me.src;
        me.#handler.mode = me.mode;
        me.#handler.action = me.action;
        me.#handler.reader = me.reader;
        me.#handler.writer = me.writer;

        me.#handler.limit = me.limit;
        me.#handler.skip = me.skip;
        me.#handler.sort = me.formatSort(me.sort);
        me.#handler.filter = me.formatFilter(me.filter);
        if (me.autoload) me.read();
    }

    get isDebug() {
        return this.dataset.gsDebug;
    }

    get handler() {
        return this.#handler;
    }

    get isRegistered() {
        return this.#handler?.isRegistered === true;
    }

    get isOffline() {
        return this.#handler?.isOffline;
    }

    set search(val) {
        if (this.#handler) this.#handler.search = val;
    }

    /**
     * Filter data in format 
     * [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     */
    formatFilter(val) {
        val = this.#formated(val);
        return Array.isArray(val) ? val : [];
    }

    /**
     * Sort data in format
     * [{col: idx[num] || name[string]  , op: -1 | 1 }]
     */
    formatSort(val) {
        val = this.#formated(val);
        let sort = undefined;
        if (typeof val === 'string') {
            sort = [{ col: val }];
        } else if (Array.isArray(val)) {
            sort = val;
        } else if (GSUtil.isNumber(val)) {
            const idx = Math.abs(val);
            sort = new Array(idx);
            sort[idx - 1] = { ord: val };
        }
        return sort || [];
    }

    schedule(time = 0) {
        const me = this;
        time = GSUtil.asNum(time) * 1000;
        clearInterval(me.#iid);
        if (time > 0) me.#iid = setInterval(() => {
            me.read(me);
        }, time);
    }

    read() {
        return this.#lifoReadRef();
    }

    write(data) {
        const me = this;
        me.#verifyHandler();
        me.#handler?.write(me, data);
    }

    load() {
        return this.read();
    }

    save(data) {
        return this.write(data);
    }

    /**
     * Callback for data read result
     */
    onDataRead(obj) {
        if (this.isDebug) GSLog.log(this, 'Data Read: ' + JSON.stringify(obj));
    }

    /**
     * Callback for data write result
     * @param {*} obj 
     */
    onDataWrite(obj) {
        if (this.isDebug) GSLog.log(this, 'Data write: ' + JSON.stringify(obj));
    }

    /**
     * Process data after receive, before notifying 
     * @param {*} data 
     */
    postRead(data) {
        const me = this;
        if (!Array.isArray(data)) data = [data];
        data.forEach(r => {
            me.#config.forEach(c => {
                let val = r[c.name];
                if (!GSUtil.isNull(val)) {
                    val = GSData.format(c, val);
                    r[c.name] = val;
                }
            });
        });
    }

    /**
     * Callback on data red/write error
     * @param {*} obj 
     */
    onDataError(obj) {
        if (this.isDebug) GSLog.log(this, 'Data error: ' + JSON.stringify(obj));
    }

    #verifyHandler() {
        const me = this;
        if (me.isOffline || me.isRegistered) return;
        throw new Error('Data handler not initialized!');
    }

    #initLIFO() {
        const me = this;
        me.#lifoReadRef = GSFunction.callOnceLifo(me.#lifoReadRefCallback, me);
    }

    #lifoReadRefCallback() {
        const me = this;
        me.#initLIFO();
        return me.#lifoRead();
    }

    #lifoRead() {
        const me = this;
        me.#verifyHandler();
        return me.#handler?.read(me);
    }

    #formated(val) {
        return GSUtil.isJsonString(val) ? JSON.parse(val) : val;
    }

    static {
        this.define('gs-data-handler');
    }
}