/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSLog } from "./GSLog.mjs";
import { GSDOM } from "./GSDOM.mjs";
import { GSAttr } from "./GSAttr.mjs";
import { GSUtil } from "./GSUtil.mjs";
import { GSEvents } from "./GSEvents.mjs";
import { GSFunction } from "./GSFunction.mjs";
import { GSTemplateCache } from "./GSTemplateCache.mjs";

/**
 * A module GSAttributeHandler GSAttr class
 * @module base/GSDOM
 */

/**
 * Attributes to control click actions for buttons and links.
 * Used for meta linking between UI elements
 * 
 * Attributes handled:
 * - data-gs-attribute - toggle element attribute (receive k=v;k1=v1 or JSON format)
 * - data-gs-action - trigger action event
 * - data-gs-anchor - where to anchor injected html (self, beforebegin, afterbegin, etc.)
 * - data-gs-call - calls a function on a given target (multiple functions supported)
 * - data-gs-exec - execute a function (alternative to the call)
 * - data-gs-inject - inject HTML content; used for WebComponent append
 * - data-gs-property - togle element property (receive k=v;k1=v1 or JSON format)
 * - data-gs-swap - swap HTML content; used for WebComponent replacement
 * - data-gs-target - CSS query for a target or targets
 * - data-gs-template - template to load and inject template
 * - data-gs-timeout - a timeout between class toggle
 * - data-gs-toggle - toggle CSS classes on a given target
 * - data-gs-trigger - triggers an event on a given target
 * - data-gs-value - value to pass to a gs-call or gs-trigger
 *
 * NOTE: 
 * data-gs-swap and gs-inject uses data-gs-anchor to determine 
 * where to inject html. If not, set, innerHTML is used
 * 
 * data-gs-target determine element on which to execute,
 * if not specified, it means current element
 * 
 * @class
 */
export class GSAttributeHandler {

    static #reverse = Symbol();
    static #link = Symbol();

    static DEFINITION = {
        action: { attribute: 'data-gs-action' },
        anchor: { attribute: 'data-gs-anchor' },
        attribute: { attribute: 'data-gs-attribute' },
        call: { attribute: 'data-gs-call' },
        exec: { attribute: 'data-gs-exec' },
        inject: { attribute: 'data-gs-inject' },
        property: { attribute: 'data-gs-property' },
        swap: { attribute: 'data-gs-swap' },
        target: { attribute: 'data-gs-target' },
        template: { attribute: 'data-gs-template' },
        toggle: { attribute: 'data-gs-toggle' },
        trigger: { attribute: 'data-gs-trigger' },
        value: { attribute: 'data-gs-value' },

        calls: { attribute: 'data-gs-call', multi: true },
        toggles: { attribute: 'data-gs-toggle', multi: true },
        timeout: { attribute: 'data-gs-timeout', type: Number },
        triggers: { attribute: 'data-gs-trigger', multi: true },
    }

    #host;
    #proxy;
    #active = false;
    #callback;

    constructor(el) {
        const me = this;
        me.#host =  el.isProxy ? el.self : el;
        me.#callback = me.handle.bind(me);
        me.#proxy = el.isProxy ? el : GSAttributeHandler.proxify(me.#host);
    }

    /**
     * Main function to process element data-gs-* attributes
     * @param {Event} e 
     */
    handle(e) {
        const me = this;
        me.targets.forEach(el => me.#handleTarget(me.#host, el, e));
    }

    /**
     * Process each individual data-gs-* attribute
     * @param {GSElement} host 
     * @param {String|HTMLElement} target 
     * @param {Event} evt 
     */
    #handleTarget(host, target, evt) {
        const me = this;
        me.#handleBinding(target, evt);
        me.#handleAction(target);
        me.#handleSwap(host, target);
        me.#handleInject(host, target);
        me.#handleAttribute(target);
        me.#handleProperty(target);
        me.#handleToggle(target);
        me.#handleTrigger(target, evt);
        me.#handleCall(host, target, evt);
        me.#handleExec(host, target, evt);
        me.#handleTemplate(host, target);
    }

    /**
     * Bind provided value to the form or form element
     * @param {HTMLFormElement|HTMLInputElement} target 
     * @param {Event} evt 
     * @returns 
     */
    #handleBinding(target, evt) {
        const source = evt?.target?.field || evt?.target?.form || evt?.target;
        const isForm = source instanceof HTMLFormElement;
        const isField = GSDOM.isFormElement(source);
        if (!(isField || isForm)) return;
        if (isField) {
            target[source.name] = GSDOM.getValue(source);
        } else {
            Object.assign(target, GSDOM.toObject(source));
        }
    }

    /**
     * Trigger 'action' event on target to execute specific function
     * @param {GSElement} target 
     */
    #handleAction(target) {
        if (this.action) GSEvents.send(target, 'action', this.action, true, true);
    }

    /**
     * Set target attribute value
     * @param {HTMLElement} target 
     * @returns 
     */
    #handleAttribute(target) {
        const me = this;

        if (me.inject) target = GSDOM.query(target, me.inject);
        if (me.swap) target = GSDOM.query(target, me.swap);

        if (me.isAttributeJSON) {
            const obj = GSUtil.toJson(me.attribute);
            return GSAttr.jsonToAttr(target, obj);
        }
        const attrs = me.attributes;
        attrs.forEach(v => me.#toggleAttribute(target, v[0], me.value || v[1]));
    }

    /**
     * Set value to target propery
     * @param {GSElement} target 
     * @returns 
     */
    #handleProperty(target) {
        const me = this;
        if (me.inject) target = GSDOM.query(target, me.inject);
        if (me.swap) target = GSDOM.query(target, me.swap);
        if (me.isPropertyJSON) {
            const obj = GSUtil.toJson(me.property);
            return Object.assign(target, obj);
        }
        const props = me.properties;
        props.forEach(v => me.#toggleProperty(target, v[0], me.value || v[1]));
    }

    #toggleAttribute(target, name, value) {

        if (GSUtil.isBool(target[name])) {
            return GSAttr.toggle(target, name, !target[name]);
        } else if (GSUtil.isNumber(target[name])) {
            value = GSUtil.asNum(value);
        }
        GSAttr.set(target, name, value);
    }

    #toggleProperty(target, name, value) {
        if (GSUtil.isBool(target[name])) {
            if (GSUtil.isStringEmpty(value)) {
                target[name] = !target[name];
            } else {
                target[name] = GSUtil.asBool(value);
            }
        } else if (GSUtil.isNumber(target[name])) {
            target[name] = GSUtil.asNum(value);
        } else {
            target[name] = value;
        }
    }

    /**
     * Toggle target css class
     * @param {HTMLElement} target 
     */
    async #handleToggle(target) {
        const me = this;
        const tout = me.timeout * 1000;
        let toggles = me.toggles;
        if (tout === 0) {
            toggles.forEach(v => GSDOM.toggleClass(target, v));
        } else {
            if (target[me.#symbol]) toggles = toggles.reverse();
            for (const v of toggles) {
                await GSUtil.timeout(tout);
                GSDOM.toggleClass(target, v);
            }
            target[me.#symbol] = !target[me.#symbol];
        }
    }

    /**
     * Calls a function on a target
     * @param {GSElement} host 
     * @param {HTMLElement} target 
     * @param {Event} evt 
     */
    #handleCall(host, target, evt) {
        const val = GSUtil.isJsonString(host.value) ? GSUtil.toJson(host.value) : host.value;
        this.calls.forEach(v => GSFunction.callFunction(target[v], target, true, val || evt));
    }

    /**
     * Calls a function on a target
     * @param {*} host 
     * @param {*} target 
     * @param {*} evt 
     * @returns 
     */
    #handleExec(host, target, evt) {
        if (!this.exec) return;
        try {
            new Function(this.exec).bind(target)(evt);
        } catch (e) {
            GSLog.error(target, e);
        }
    }

    /**
     * Send an event to a target
     * @param {HTMLElement} target 
     * @param {Event} evt 
     */
    #handleTrigger(target, evt) {
        this.triggers.forEach(v => GSEvents.send(target, v, evt));
    }

    #handleContent(host, target, value, clean = false) {
        const me = this;
        if (value) {
            let src = '';
            const useDef = GSUtil.asBool(value);
            if (useDef) {
                src = GSDOM.fromJsonAsString(me.definition);
            } else {                
                src = me.#toHTML(value);                
            }

            const content = GSDOM.parse(src, true);

            if (!useDef) {
                GSAttr.jsonToAttr(me.definition, content);
            }

            if (clean) { 
                target.innerHTML = '';
            }

            me.#applyContent(host, target, content);
        }
    }


    /**
     * Inject HTML to target
     * @param {GSElement} host 
     * @param {HTMLElement} target 
     */
    #handleInject(host, target) {
        this.#handleContent(host, target, this.inject, false);
    }

    /**
     * Swap inner HTML on a target
     * @param {HTMLElement} target 
     */
    #handleSwap(host, target) {
        this.#handleContent(host, target, this.swap, true);
    }

    /**
     * Convert value as URL to a tempalte or as a component name to inject
     * @param {String} value 
     * @returns {String}
     */
    #toHTML(value = '') {
        return value.indexOf('/') < 0 ? `<${value}></${value}>` : `<gs-template flat src="${value}"></gs-template>`;
    }

    /**
     * Load HTML template and apply to a target
     * @param {GSElement} host 
     * @param {HTMLElement} target 
     */
    async #handleTemplate(host, target) {
        const tpl = await GSTemplateCache.loadTemplate(true, this.template, this.template);
        this.#applyTemplate(host, target, tpl);
    }

    /**
     * Apply htmltemplate to a target
     * @param {GSElement} host 
     * @param {HTMLElement} target 
     * @param {HTMLTemplateElement} template 
     */    
    #applyTemplate(host, target, template) {
        const content = GSTemplateCache.clone(template);
        this.#applyContent(host, target, content);
    }

    /**
     * Apply html template to a target
     * @param {GSElement} host 
     * @param {HTMLElement} target 
     * @param {HTMLTemplateElement} content 
     */    
    #applyContent(host, target, content) {
        if (host?.anchor) {
            GSDOM.insertAdjacent(target, content, host.anchor);
        } else {
            GSDOM.appendChild(target, content);
        }
    }

    attach(name = 'click') {
        const me = this;
        if (!me.#active) {
            GSEvents.on(me.#host, null, name, me.#callback);
            me.#active = true;
        }
    }

    detach(name = 'click') {
        //GSEvents.detachListeners(this.#host);
        const me = this;
        GSEvents.off(me.#host, null, name, me.#callback);
        me.#active = false;
    }

    get #symbol() {
        return GSAttributeHandler.#reverse;
    }

    get targets() {
        const me = this;
        switch (me.target) {
            case 'this':
            case 'self':
                return [me.#host];
            case 'owner':
                //return [GSDOM.root(me.#host)];
                return [me.#host.parentComponent];
            case 'parent':
                return [me.#host.parentElement];
        }
        const list = GSDOM.queryAll(document.body, me.target, false, true).filter(el => el.tagName !== 'GS-ITEM'); 
        if (list.length === 0) list.push(me.#host);
        return list;
    }

    get host() { return this.#host; }

    get definition() { return this.#proxy[Symbol.for('#def')]; }

    get action() { return this.#proxy.action; }
    get anchor() { return this.#proxy.anchor; }
    get attribute() { return this.#proxy.attribute; }
    get exec() { return this.#proxy.exec; }
    get call() { return this.#proxy.call; }
    get inject() { return this.#proxy.inject; }
    get property() { return this.#proxy.property; }
    get swap() { return this.#proxy.swap; }
    get target() { return this.#proxy.target; }
    get toggle() { return this.#proxy.toggle; }
    get trigger() { return this.#proxy.trigger; }
    get timeout() { return this.#proxy.timeout; }
    get template() { return this.#proxy.template; }
    get value() { return this.#proxy.value; }

    get calls() { return this.#proxy.calls; }
    get toggles() { return this.#proxy.toggles; }
    get triggers() { return this.#proxy.triggers; }

    get attributes() {
        const val = this.#proxy.attribute || '';
        return val.split(/[,;]/g).map(v => v.split('=')).filter(v => GSUtil.isStringNonEmpty(v));
    }

    get properties() {
        const val = this.#proxy.property || '';
        return val.split(/[,;]/g).map(v => v.split('=')).filter(v => GSUtil.isStringNonEmpty(v));
    }

    /**
     * Is property value JSON
     */
    get isPropertyJSON() {
        return GSUtil.isJson(this.property);
    }

    /**
     * Is element attribute value JSON
     */
    get isAttributeJSON() {
        return GSUtil.isJson(this.attribute);
    }

    /**
     * Wrap any element into data-gs-* handler
     * @param {HTMLElement} el 
     * @returns {Proxy}
     */
    static proxify(el) {
        return GSAttr.proxify(el, GSAttributeHandler.DEFINITION);
    }

    /**
     * Process data-gs-* attributtes on a element
     * @param {HTMLElement} el 
     * @param {Event} e 
     * @returns 
     */
    static process(el, e) {
        if (!el?.hasAttribute('data-gs-target')) return;
        let me = el[GSAttributeHandler.#link];
        if (!(me instanceof GSAttributeHandler)) {
            me = new GSAttributeHandler(el);
            el[GSAttributeHandler.#link] = me;
        }
        me.handle(e);
    }

    /**
     * Create a new attribute handler instance
     * @param {HTMLElement} el 
     * @returns 
     */
    static create(el) {
        const me = new GSAttributeHandler(el);
        me.attach();
        return me;
    }

    /**
     * Clone element attributes (GS-ITEM to real WebComponent)
     * @param {HTMLElement} from 
     * @param {HTMLElement} to 
     * @param {boolean} override If 'false' will skip existing atributes
     */
    static clone(from, to, override = true) {
        const def = GSAttributeHandler.DEFINITION;
        Object.values(def)
            .filter(o => from.hasAttribute(o.attribute))
            .filter(o => override || !to.hasAttribute(o.attribute))          
            .forEach(o => to.setAttribute(o.attribute, from.getAttribute(o.attribute)));
    }

    /**
     * Check if component is bindable to events
     * @param {HTMLElement} el 
     * @returns 
     */
    static isBindable(el) {
        const def = GSAttributeHandler.DEFINITION;
        return Object.values(def)
            .filter(o => el.hasAttribute(o.attribute))
            .length > 0;

    }

    static {
        const def = GSAttributeHandler.DEFINITION;
        Object.values(def).forEach(o => Object.freeze(o));
        Object.freeze(def);
    }
}