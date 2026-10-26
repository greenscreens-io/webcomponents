/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading ServiceWorkkerElement class
 * @module components/ServiceWorkkerElement
 */

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

    #registration = null;
    #messageChannel = null;
    #loading;
    #unloading;
    #generation = 0;
    #monitoredRegistration;
    #monitoredWorker;
    #reloading = false;
    #onControllerChange = () => {
        if (!this.#reloading) {
            this.#reloading = true;
            window.location.reload();
        }
    };
    #onUpdateFound = () => {
        const worker = this.#registration?.installing;
        if (worker === this.#monitoredWorker) return;
        this.#monitoredWorker?.removeEventListener('statechange', this.#onWorkerStateChange);
        this.#monitoredWorker = worker;
        worker?.addEventListener('statechange', this.#onWorkerStateChange);
    };
    #onWorkerStateChange = () => {
        const registration = this.#registration;
        if (this.isConnected && !this.disabled && registration?.active) this.#initChannel();
        if (registration?.waiting) {
            this.#monitoredWorker?.removeEventListener('statechange', this.#onWorkerStateChange);
            this.#monitoredWorker = undefined;
            if (navigator.serviceWorker.controller) {
                void this.#invokeServiceWorkerUpdateFlow(registration);
            } else {
                this.#trace('Service Worker initialized for the first time');
            }
        }
    };

    constructor() {
        super();
        this.flat = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this.#reloading = false;
        if (!this.disabled) void this.#load();
    }

    disconnectedCallback() {
        void this.#unload(false);
        super.disconnectedCallback();
    }

    willUpdate(changed) {
        const me = this;
        if (changed.has('trace')) {
            me.#ServiceWorkerTraceUpdate();
        }
        if (changed.has('disabled')) {
            if (me.disabled) {
                void me.#unload(true);
            } else if (me.isConnected) {
                void me.#load();
            }
        } else if (me.hasUpdated && (changed.has('src') || changed.has('scope') || changed.has('module'))) {
            void me.#restart();
        }
        super.willUpdate(changed);
    }

    /**
     * Returns true if the service worker is available in the browser and the src is a valid URL.
     */
    get available() {
        const me = this;
        return !!globalThis.navigator?.serviceWorker && !!me.src && GSUtil.isURL(me.src);
    }

    /**
     * Returns the service worker registration object.
     */
    get registration() {
        return this.#registration;
    }

    get isLoaded() {
        return !!this.#registration?.active;
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
        this.#trace('ServiceWorker message received:', event);
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
        if (me.#registration?.active && !me.#messageChannel) {
            me.#messageChannel = new MessageChannel();
            me.#messageChannel.port1.onmessage = me.#onWorkerMessage;
            me.#ServiceWorkerTraceUpdate();
            me.#registration.active.postMessage('INIT_PORT', [me.#messageChannel.port2]);
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
        if (this.#monitoredRegistration === registration) return;
        this.#clearRegistrationListeners();
        this.#monitoredRegistration = registration;
        this.#monitoredWorker = registration.installing;
        this.#monitoredWorker?.addEventListener('statechange', this.#onWorkerStateChange);
        registration.addEventListener('updatefound', this.#onUpdateFound);
    }

    #monitorController() {
        navigator.serviceWorker.removeEventListener('controllerchange', this.#onControllerChange);
        navigator.serviceWorker.addEventListener('controllerchange', this.#onControllerChange);
    }

    #clearRegistrationListeners() {
        this.#monitoredRegistration?.removeEventListener('updatefound', this.#onUpdateFound);
        this.#monitoredWorker?.removeEventListener('statechange', this.#onWorkerStateChange);
        this.#monitoredRegistration = undefined;
        this.#monitoredWorker = undefined;
    }

    async #unload(unregister = this.disabled) {
        const me = this;
        me.#generation++;
        const registration = me.#registration;
        if (globalThis.navigator?.serviceWorker) {
            navigator.serviceWorker.removeEventListener('controllerchange', me.#onControllerChange);
        }
        me.#clearRegistrationListeners();
        me.#loading = undefined;
        if (unregister) me.#registration = null;
        me.#messageChannel?.port1.close();
        me.#messageChannel?.port2.close();
        me.#messageChannel = null;
        const unloading = unregister && registration
            ? registration.unregister().catch(error => {
                console.error('Service Worker unregistration failed:', error);
            })
            : Promise.resolve();
        me.#unloading = unloading;
        try {
            await unloading;
        } finally {
            if (me.#unloading === unloading) me.#unloading = undefined;
        }
    }

    async #restart() {
        if (this.#loading) await this.#loading;
        await this.#unload(true);
        if (this.isConnected && !this.disabled) await this.#load();
    }

    async #load() {
        const me = this;
        if (me.#unloading) await me.#unloading;
        if (me.disabled || !me.isConnected) return;
        if (me.#loading) return me.#loading;

        if (!me.available) {
            console.warn('Service Worker is not available in this browser or src is not valid.');
            me.emit('loaded', false, true, true, true);
            return;
        }
        const generation = ++me.#generation;
        const loading = (async () => {
            try {
                const opt = me.scope ? { scope: me.scope } : {};
                if (me.module) opt.type = 'module';
                const registration = await navigator.serviceWorker.register(me.src, opt);
                if (generation !== me.#generation || !me.isConnected || me.disabled) {
                    if (me.disabled) await registration.unregister();
                    return;
                }
                me.#registration = registration;
                me.#trace('ServiceWorker registration started:', registration);
                me.#monitorController();
                void me.#invokeServiceWorkerUpdateFlow(registration);
                me.#monitorServiceWorkerUpdate(registration);
                me.#initChannel();
                me.#trace('ServiceWorker registration successful with scope: ', registration.scope);
            } catch (error) {
                if (generation === me.#generation) {
                    me.#registration = null;
                    console.error('Service Worker registration failed:', error);
                }
            } finally {
                if (generation === me.#generation) {
                    me.emit('loaded', me.isLoaded, true, true, true);
                }
            }
        })();
        me.#loading = loading;
        try {
            await loading;
        } finally {
            if (me.#loading === loading) me.#loading = undefined;
        }
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
