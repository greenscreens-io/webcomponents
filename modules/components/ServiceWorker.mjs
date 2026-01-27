/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading ServiceWorkkerElement class
 * @module components/ServiceWorkkerElement
 */

import { GSLoader } from '../base/GSLoader.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSElement } from '../GSElement.mjs';

/**
 * An easy way to register a service worker in the browser.
 * @class
 * @extends { GSlement }
 */
export class ServiceWorkkerElement extends GSElement {

    static properties = {
        src: {},
        scope: {},
        module: { type: Boolean, default: false },
        trace: { type: Boolean, reflect: true, default: false },
        disabled: { type: Boolean, reflect: true, default: false }
    }

    #registration = false
    #workerMessage = null;
    #messageChannel = null;

    #nocache = false;

    constructor() {
        super();
        this.flat = true;
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.#workerMessage = me.#onWorkerMessage.bind(me);
        me.#load();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#unload();
    }

    willUpdate(changed) {
        const me = this;
        if (changed.has('trace')) {
            me.#ServiceWorkerTraceUpdate();
        }
        if (changed.has('disabled')) {
            me.disabled ? me.#unload() : me.#load();
        }
        super.willUpdate(changed);
    }

    /**
     * Returns true if the service worker is available in the browser and the src is a valid URL.
     */
    get available() {
        const me = this;
        return 'serviceWorker' in navigator && me.src && GSUtil.isURL(me.src);
    }

    /**
     * Returns the service worker registration object.
     */
    get registration() {
        return this.#registration;
    }

    /**
     * Request the service worker to clear its cache.
     * @returns 
     */
    clearCache() {
        return this.postMessage("CLEAR_CACHE");
    }

    /**
     * Request the service worker to pupdate preloads
     * @returns 
     */
    refresh() {
        return this.postMessage("REFRESH_CACHE");
    }

    /**
     * Send a message to the service worker.
     * @param {*} message The message to send to the service worker.
     * @returns {boolean} Returns true if the message was sent, false if the service worker is not active or not registered.
     */
    postMessage(message) {
        const me = this;
        const sts = GSUtil.nonNull(message) && me.isLoaded;
        if (sts) {
            if (me.#messageChannel) {
                me.#messageChannel.port1.postMessage(message);
            } else {
                me.#registration?.active?.postMessage(message);
            }
        }
        return sts;
    }

    /**
     * Method to handle messages from the service worker.
     * Override this method to handle messages from the service worker.
     * The default implementation does nothing.
     * @param {Event} event 
     * @returns {boolean} Return false to stop the event propagation, true to continue.
     */
    onMessage(event) {
        me.#trace('ServiceWorker message received:', event);
        return true;
    }

    #onWorkerMessage = (event) => {
        const me = this;
        if (event.data) {
            if (me.onMessage(event)) {
                me.emit('message', event.data, true, true, true);
            }
        } else {
            me.#trace('ServiceWorker message is empty:', event);
        }
    }

    #initChannel() {
        const me = this;
        if (me.#registration?.active) {
            me.#messageChannel = new MessageChannel();
            me.#messageChannel.port1.onmessage = me.#workerMessage;
            me.#ServiceWorkerTraceUpdate();
            me.#registration.active.postMessage('INIT_PORT', [me.#messageChannel.port2]);
            //me.emit('activated', isActive, true, true, true);
        }
    }

    #ServiceWorkerTraceUpdate() {
        const me = this;
        me.#registration?.active?.postMessage(me.trace ? 'TRACE_ON' : 'TRACE_OFF');
    }

    // Show a notification to the user that a new version of the app is available
    async #invokeServiceWorkerUpdateFlow(registration) {
        return registration?.waiting?.postMessage('NOTIFICATION_WAITING');
    }

    // detect Service Worker update available and wait for it to become installed
    #monitorServiceWorkerUpdate(registration) {
        const me = this;
        registration.addEventListener('updatefound', () => {
            // wait until the new Service worker is actually installed (ready to take over)
            registration.installing?.addEventListener('statechange', () => {
                if (registration.waiting) {
                    // if there's an existing controller (previous Service Worker), show the prompt
                    if (navigator.serviceWorker.controller) {
                        me.#invokeServiceWorkerUpdateFlow(registration);
                    } else {
                        // otherwise it's the first install, nothing to do
                        me.#trace('Service Worker initialized for the first time');
                    }
                }
            });
        })
    }

    // detect controller change and refresh the page
    #monitorController() {
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    }

    async #unload() {
        const me = this;
        GSLoader.NO_CACHE = me.#nocache;
        if (me.disabled) {
            await me.#registration?.unregister();
        }
        me.#messageChannel?.port1.close();
        me.#messageChannel?.port2.close();
        me.#messageChannel = null;
        me.#registration = null;
    }

    // Load the service worker
    async #load() {
        const me = this;
        if (me.disabled) return;
        me.#nocache = GSLoader.NO_CACHE;
        GSLoader.NO_CACHE = false;

        if (!me.available) {
            console.warn('Service Worker is not available in this browser or src is not valid.');
            return;
        }        
        try {
            const opt = me.scope ? { scope: me.scope } : {};
            if (me.module) opt.type = 'module';
            me.#registration = await navigator.serviceWorker.register(me.src, opt);
            me.#trace('ServiceWorker registration started:', me.#registration);

            me.#monitorController();
            me.#invokeServiceWorkerUpdateFlow(me.#registration);
            me.#monitorServiceWorkerUpdate(me.#registration);
            me.#initChannel(me.#registration);

            me.#trace('ServiceWorker registration successful with scope: ', me.#registration.scope);

        } catch (error) {
            me.#registration = false;
            console.error('Service Worker registration failed:', error);
        }
        me.emit('loaded', me.isLoaded, true, true, true);
    }

    #trace(message, data = '') {
        if (this.trace) {
            console.log(message, data);
        }
    }

    static {
        this.define('gs-service-worker');
    }
}
