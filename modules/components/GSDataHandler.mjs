/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */

import GSAttr from "../base/GSAttr.mjs";
import GSComponents from "../base/GSComponents.mjs";
import GSData from "../base/GSData.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSFunction from "../base/GSFunction.mjs";
import GSLog from "../base/GSLog.mjs";
import GSReadWrite from "../base/GSReadWrite.mjs";
import GSReadWriteRegistry from "../base/GSReadWriteRegistry.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * A module loading GSDataHandler class
 * @module components/GSDataHandler
 */

/**
 * GUI element for GSReadWrite for easier usage
 * @class
 * @extends {HTMLElement}
 */
export default class GSDataHandler extends HTMLElement {

    static {
        customElements.define('gs-data-handler', GSDataHandler);
        Object.seal(GSDataHandler);
    }

    static observeAttributes(attributes) {
        return GSData.mergeArrays(attributes, GSDataHandler.observedAttributes);
    }

    static get observedAttributes() {
        return ['src', 'limit', 'skip', 'action', 'mode', 'reader', 'writer', 'disabled'];
    }

    #handler = null;
    #reader = null;
    #writer = null;
    #error = null;
    #lifoReadRef = null;
    #requestID = null;
    #external = false;

    constructor() {
        super();
        const me = this;
        if (!me.id) throw new Error('Element ID is required attribute!');
        me.#initLIFO();
        me.#reader = me.#onRead.bind(this);
        me.#writer = me.#onWrite.bind(this);
        me.#error = me.#onError.bind(this);
        //me.#handler = new GSReadWrite(me.id, false);
    }

    connectedCallback() {
        const me = this;
        GSComponents.store(me);
        me.#requestID = requestAnimationFrame(() => {
            me.#requestID = null;
            me.#initHandler();
        });
    }

    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSEvents.deattachListeners(me);
        if (me.#requestID) cancelAnimationFrame(me.#requestID);
        if (!me.#external) me.#handler?.disable();
        me.#requestID = null;
        me.#handler = null;
        me.#reader = null;
        me.#writer = null;
        me.#error = null;
        me.#lifoReadRef = null;
    }

    /**
     * Called when element attribute changed
     *  
     * @param {string} name  Attribute name
     * @param {string} oldValue Old value before change
     * @param {string} newValue New value after change
     */
    attributeChangedCallback(name, oldValue, newValue) {
        const me = this;
        if (oldValue === newValue) return;
        if (GSComponents.hasSetter(me.#handler, name)) {
            let err = null;
            try {
                me.#handler[name] = newValue;
                if (name === 'mode') {
                    me.writer = me.#handler.writer;
                    me.reader = me.#handler.reader;
                }
                if (name === 'writer') return;
                if(me.isRegistered) me.#lifoReadRef();
            } catch (e) {
                me[name] = oldValue;
                GSLog.error(this, e);
            } 
        }
        if (name === 'disabled') return me.#toggleHandler();
    }

    /**
     * Wait for event to happen
     * 
     * @async
     * @param {*} name 
     * @returns {Promise<void>}
     */
    async waitEvent(name = '', signal) {
        const me = this;
        const callback = (resolve, reject) => {
            me.once(name, (evt) => resolve(evt.detail));
        }
        return new GSPromise(callback, signal).await();
    }

    /**
     * Listen once for triggered event
     * 
     * @param {*} name 
     * @param {*} func 
     */
    once(name, func) {
        return this.attachEvent(this, name, func, true);
    }

    /**
     * Attach event to this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    on(name, func) {
        return this.attachEvent(this, name, func);
    }

    /**
     * Remove event from this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    off(name, func) {
        this.removeEvent(this, name, func);
    }

    /**
     * Attach event to this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    listen(name, func) {
        return this.on(name, func);
    }

    /**
     * Remove event from this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    unlisten(name, func) {
        this.off(name, func);
    }

    /**
    * Generic event listener appender
    * TODO handle once events to self remove
    * TODO handle fucntion key override with same function signature dif instance
    */
    attachEvent(el, name = '', fn, once = false) {
        return GSEvents.attach(this, el, name, fn, once);
    }

    /**
    * Generic event listener remover
    */
    removeEvent(el, name = '', fn) {
        GSEvents.remove(this, el, name, fn);
    }

    async #initHandler() {

        const me = this;

        me.#handler?.disable();
        me.#unlistenHandler();

        // manual store, not linked to external source
        if (me.#isInternal) {
            me.#handler = new GSReadWrite(me.id, !me.disabled);
        } else {
            me.#handler = await GSReadWriteRegistry.wait(me.id);
            me.#external = true;
        }

        me.#updateHandler();
        me.#listenHandler();
        // me.read();
        GSEvents.send(me, 'ready', {}, true, true, true);
    }

    get #isInternal() {
        const me = this;
        return (me.src || me.mode || me.reader || me.writer);
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
        me.#handler.sort = me.sort;
        me.#handler.filter = me.filter;
    }

    #listenHandler() {
        const me = this;
        me.attachEvent(me.#handler, 'read', me.#reader);
        me.attachEvent(me.#handler, 'write', me.#writer);
        me.attachEvent(me.#handler, 'error', me.#error);
    }

    #unlistenHandler() {
        const me = this;
        me.removeEvent(me.#handler, 'read', me.#reader);
        me.removeEvent(me.#handler, 'write', me.#writer);
        me.removeEvent(me.#handler, 'error', me.#error);
    }

    #toggleHandler() {
        const me = this;
        if (me.disabled) {
            me.#handler?.disable();
            me.#unlistenHandler();
        } else if (!me.isRegistered) {
            me.#handler?.enable();
            me.#listenHandler();
        }
    }

    #verifyHandler() {
        const me = this;
        if (me.disabled || me.isRegistered) return;
        throw new Error('Data handler not initialized!');
    }

    #onRead(e) {
        const me = this;
        if (me.dataset.gsDebug) GSLog.log(me, JSON.stringify(e.detail));
        if (me.isRegistered) me.onRead(e.detail.data);
    }

    #onWrite(e) {
        const me = this;
        if (me.dataset.gsDebug) GSLog.log(me, JSON.stringify(e.detail));
        if (me.isRegistered) me.onWrite(e.detail.data);
    }

    #onError(e) {
        const me = this;
        if (me.dataset.gsDebug) GSLog.log(me, JSON.stringify(e.detail));
        if (me.isRegistered) me.onError(e.detail);
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

    #defaultReader(val) {
        return this.mode === 'quark' ? val || '' : val || 'GET';
    }

    #defaultWriter(val) {
        return this.mode === 'quark' ? val || '' : val || 'POST';
    }    

    /**
     * Callback for data read result
     */
    onRead(obj) {

    }

    /**
     * Callback for data write result
     * @param {*} obj 
     */
    onWrite(obj) {

    }

    /**
     * Callback on data red/write error
     * @param {*} obj 
     */
    onError(obj) {

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

    get isRegistered() {
        return this.#handler?.isRegistered === true;
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(val = '') {
        return GSAttr.toggle(this, 'disabled', GSUtil.asBool(val));
    }

    /**
     * Base URL for remote service
     */
    get src() {
        return GSAttr.get(this, 'src', '');
    }

    set src(val = '') {
        return GSAttr.set(this, 'src', val);
    }

    /**
     * Parameterized query segment
     */
    get action() {
        return GSAttr.get(this, 'action');
    }

    set action(val = '') {
        return GSAttr.set(this, 'action', val);
    }

    /**
     * HTTP operational mode
     * rest, query, quark 
     */
    get mode() {
        const me = this;
        return GSAttr.get(this, 'mode', me.src ? 'query':'');
    }

    set mode(val) {
        return GSAttr.set(this, 'mode', val || 'query');
    }

    /**
     * HTTP Read operation
     */
    get reader() {
        const me = this;
        return GSAttr.get(this, 'reader', me.#defaultReader());
    }

    set reader(val) {
        const me = this;
        return GSAttr.set(me, 'reader', me.#defaultReader(val));
    }

    /**
     * HTTP write operation
     */
    get writer() {
        const me = this;      
        return GSAttr.get(me, 'writer', me.#defaultWriter());
    }

    set writer(val) {
        const me = this;      
        return GSAttr.set(me, 'writer', me.#defaultWriter(val));
    }

    /**
     * Records to retrieve
     */
    get limit() {
        return GSAttr.getAsNum(this, 'limit', 0);
    }

    set limit(val = 0) {
        return GSAttr.setAsNum(this, 'limit', val, 0);
    }

    /**
     * Records to skip
     */
    get skip() {
        return GSAttr.getAsNum(this, 'skip', 0);
    }

    set skip(val = 0) {
        return GSAttr.setAsNum(this, 'skip', val, 0);
    }

    /**
     * Filter data in format 
     * [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     */
    get filter() {
        return this.#handler?.filter;
    }

    set filter(val) {
        const me = this;
        if (me.#handler) {
            val = GSUtil.isJsonString(val) ? JSON.parse(val) : val;
            me.#handler.filter = val;
        }
        // me.#lifoReadRef();
    }

    /**
     * Sort data in format
     * [{col: idx[num] || name[string]  , op: -1 | 1 }]
     */
    get sort() {
        return this.#handler?.sort;
    }

    set sort(val) {
        const me = this;
        if (me.#handler) {
            val = GSUtil.isString(val) ? JSON.parse(val) : val;
            me.#handler.sort = val;
        }
        // me.#lifoReadRef();
    }

    get isExternal() {
        return this.#external;
    }
}