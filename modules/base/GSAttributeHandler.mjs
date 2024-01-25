/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
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
 * - data-gs-attribute - togle element attribute (receive k=v;k1=v1 or JSON format)
 * - data-gs-action - trigger action event
 * - data-gs-anchor - where to anchor injected html (self, beforebegin, afterbegin, etc.)
 * - data-gs-call - calls a function on a given target (multipel functions supported)
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
 * NOTE: data-gs-swap and gs-inject uses data-gs-anchor to determine 
 * where to inject html. If not, set, innerHTML is used
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
        me.#host = el;
        me.#callback = me.handle.bind(me);
        me.#proxy = GSAttributeHandler.proxify(me.#host);
    }

    handle(e) {
        const me = this;
        me.targets.forEach(el => me.#handleTarget(me.#host, el, e));
    }

    #handleTarget(host, target, evt) {
        const me = this;
        me.#handleBinding(target, evt);
        me.#handleAction(target);
        me.#handleAttribute(target);
        me.#handleProperty(target);
        me.#handleToggle(target);
        me.#handleTrigger(target, evt);
        me.#handleCall(host, target, evt);
        me.#handleExec(host, target, evt);
        me.#handleSwap(target);
        me.#handleInject(host, target);
        me.#handleTemplate(host, target);
    }

    #handleBinding(target, evt) {
        const source = evt.target.field || evt.target.form || evt.target;
        const isForm = source instanceof HTMLFormElement;
        const isField = GSDOM.isFormElement(source);
        if (isField) {
            target[source.name] = GSDOM.getValue(source);
        } else {
            Object.assign(target, GSDOM.toObject(source));
        }
        if (!(isField || isForm)) return;
    }

    #handleAction(target) {
        const me = this;
        GSEvents.send(target, 'action', me.action);
    }

    #handleAttribute(target) {
        const me = this;
        if (me.isAttributeJSON) {
            const obj = GSUtil.toJson(me.attribute);
            return GSAttr.jsonToAttr(target, obj);
        }
        const attrs = me.attributes;
        attrs.forEach(v => me.#toggleAttribute(target, v[0], me.value || v[1]));
    }

    #handleProperty(target) {
        const me = this;
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

    #handleCall(host, target, evt) {
        const val = GSUtil.isJsonString(host.value) ? GSUtil.toJson(host.value) : host.value;
        this.calls.forEach(v => GSFunction.callFunction(target[v], target, true, val || evt));
    }

    #handleExec(host, target, evt) {
        if (!this.exec) return;
        try {
            new Function(this.exec).bind(target)();
        } catch (e) {
            GSLog.error(target, e);
        }
    }

    #handleTrigger(target, evt) {
        this.triggers.forEach(v => GSEvents.send(target, v, evt));
    }

    #handleInject(host, target) {
        if (this.inject) {
            const content = GSDOM.parse(this.inject, true);
            this.#applyContent(host, target, content);
        }
    }

    #handleSwap(target) {
        if (this.swap) target.innerHTML = this.swap;
    }

    async #handleTemplate(host, target) {
        const tpl = await GSTemplateCache.loadTemplate(true, this.template, this.template);
        this.#applyTemplate(host, target, tpl);
    }

    #applyTemplate(host, target, template) {
        const content = GSTemplateCache.clone(template);
        this.#applyContent(host, target, content);
    }

    #applyContent(host, target, content) {
        if (host.anchor) {
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

    deattach(name = 'click') {
        //GSEvents.deattachListeners(this.#host);
        GSEvents.off(me.#host, null, name, me.#callback);
        this.#active = false;
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
                return [GSDOM.root(me.#host)];
            case 'parent':
                return [me.#host.parentElement];
        }
        return GSDOM.queryAll(document.body, me.target, false, true) || [me.#host];
    }

    get host() { return this.#host; }

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

    get isPropertyJSON() {
        return GSUtil.isJson(this.property);
    }

    get isAttributeJSON() {
        return GSUtil.isJson(this.attribute);
    }

    static proxify(el) {
        return GSAttr.proxify(el, GSAttributeHandler.DEFINITION);
    }

    static process(el, e) {
        if (!el?.hasAttribute('gs-target')) return;
        let me = el[GSAttributeHandler.#link];
        if (!(me instanceof GSAttributeHandler)) {
            me = new GSAttributeHandler(el);
            el[GSAttributeHandler.#link] = me;
        }
        me.handle(e);
    }

    static create(el) {
        const me = new GSAttributeHandler(el);
        me.attach();
        return me;
    }

    /**
     * Clone element attributes (GS-ITEM to real WebComponent)
     * @param {HTMLElement} from 
     * @param {HTMLElement} to 
     */
    static clone(from, to) {
        const def = GSAttributeHandler.DEFINITION;
        Object.values(def)
            .filter(o => from.hasAttribute(o.attribute))
            .forEach(o => to.setAttribute(o.attribute, from.getAttribute(o.attribute)));
    }

    static {
        const def = GSAttributeHandler.DEFINITION;
        Object.values(def).forEach(o => Object.freeze(o));
        Object.freeze(def);
    }
}