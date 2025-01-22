/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSLog } from '../base/GSLog.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSFunction } from '../base/GSFunction.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSElement } from '../GSElement.mjs';
import { numGT0 } from '../properties/verificator.mjs';
import { GSReadWriteRegistry } from '../data/ReadWriteRegistry.mjs';
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
    #lifoWriteRef = null;

    constructor() {
        super();
        const me = this;
        me.storage = me.storage || me.id;
        me.autorefresh = 0;
        me.autoload = false;
        me.flat = true;
        me.filter = [];
        me.sort = [];
        me.limit = 0;
        me.skip = 0;
        me.src = '';
        me.type = 'remote';
        me.mode = 'query';
        me.reader = 'GET';
        me.writer = 'POST';
        if (!me.isGenerated && !me.id) throw new Error('Element ID is required attribute!');
        GSItem.validate(me, me.tagName);
    }
    
    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.storage = me.storage || me.id;
        const itemHolder = me.isGenerated && me.childElementCount === 0 ? me.parentComponent : me;
        me.#config = GSItem.proxify(itemHolder, GSData.PROPERTIES);
        me.#initLIFO(true);
        me.#initLIFO(false);
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        const me = this;
        me.#handler?.disable();
        me.#handler?.removeProcessor(me);
        me.#lifoReadRef = null;
        me.#lifoWriteRef = null;
        clearTimeout(me.#iid);
    }
    
    firstUpdated() {
        const me = this;
        me.#handler = GSReadWriteRegistry.newHandler(me.type, me.storage, false);
        if (me.#config?.length > 0) me.#handler?.addProcessor(me);
        me.#updateHandler();
        me.#handler?.enable();
        me.dataController?.read();
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
        me.#handler.key = me.key;
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

    get isCached() {
        return this.#handler?.type == 'cached';
    }

    set search(val) {
        if (this.#handler) this.#handler.search = val;
    }

    get key() {
        return this.#config.filter(o => o.key).map(o => o.name).pop() || null;
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

    write(data, append = false) {
        return this.#lifoWriteRef(data, append);
    }

    load() {
        return this.read();
    }

    save(data) {
        return this.write(data);
    }

    /**
     * Return list of all selected record id's
     */
    get selected() {
        return this.#handler?.selected;
    }

    /**
     * Store selected record ID
     * @param {*} val 
     * @returns 
     */
    addSelected(val) {
        return this.#handler?.addSelected(val);
    }

    /**
     * Remove selected record ID
     * @param {*} val 
     */
    removeSelected(val) {
        return this.#handler?.removeSelected(val);
    }

    /**
     * Remove all selections
     */
    clearSelected(data) {
        return this.#handler?.clearSelected();
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

    #initLIFO(read = true) {
        const me = this;
        if (read) {
            me.#lifoReadRef = GSFunction.callOnceLifo(me.#lifoReadRefCallback, me);
        } else {
            me.#lifoWriteRef = GSFunction.callOnceLifo(me.#lifoWriteRefCallback, me);
        }
    }

    #lifoReadRefCallback() {
        const me = this;
        me.#initLIFO(true);
        return me.#lifoCall(true);
    }

    #lifoWriteRefCallback(data, append) {
        const me = this;
        me.#initLIFO(false);
        return me.#lifoCall(false, data, append);
    }
    
    #lifoCall(read = true, data, append) {
        const me = this;
        me.#verifyHandler();        
        if (read) return me.#handler?.read(me);        
        if (!append) me.#handler.clear();
        return me.#handler?.write(me, data);
    }

    #formated(val) {
        return GSUtil.isJsonString(val) ? JSON.parse(val) : val;
    }

    static {
        this.define('gs-data-handler');
    }
}