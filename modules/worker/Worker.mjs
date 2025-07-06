/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { FilterEngine } from "./Filter.mjs";
import { CacheEngine } from "./Cache.mjs";

// https://github.com/mdn/serviceworker-cookbook

/**
 * WorkerEngine class provides a simple interface to manage service worker lifecycle events,
 * caching strategies, and push notifications.
 */
export class WorkerEngine {

  #trace = false;
  #options = null;
  #filter = null;
  #cache = null;

  #notificationOptions = {
    title: "Refresh now?",
    body: "New version of the app is available.",
    requireInteraction: true,
    actions: [
      { action: 'refresh', title: 'Refresh' },
      { action: 'cancel', title: 'Cancel' }
    ],
    data: {}
  };

  constructor(options) {
    const me = this;
    me.#options = options || {};
    me.#trace = options?.trace || false;
    me.#filter = new FilterEngine(options?.filters || []);
    me.#cache = new CacheEngine(options?.cacheName || 'DefaultCache');
    self.addEventListener('install', me.#onInstall.bind(me));
    self.addEventListener('activate', me.#onActivate.bind(me));
    self.addEventListener('push', me.#onPush.bind(me));
    self.addEventListener('sync', me.#onSync.bind(me));
    self.addEventListener('fetch', me.#onFetch.bind(me));
    self.addEventListener('message', me.#onMessage.bind(me));
    self.addEventListener('messageerror', me.#onMessageError.bind(me));
    self.addEventListener('notificationclick', me.#onNotification.bind(me));
  }

  async #precacheURL() {
    const me = this;
    if (me.#options?.preCacheURL) {
      me.trace('Precached JSON definition:', me.#options?.preCacheURL);
      const response = await fetch(me.#options.preCacheURL);
      if (!response.ok) {
        throw new Error(`Failed to fetch precache URL: ${me.#options.preCacheURL}`);
      }
      const filesToCache = await response.json();
      me.trace('Precached files:', filesToCache);
      await me.#cache.addResourcesToCache(filesToCache);
    }
  }

  async #precacheAssets() {
    const me = this;
    if (me.#options?.precachedAssets) {
      me.trace('Precached assets:', me.#options?.precachedAssets);
      await me.#cache.addResourcesToCache(me.#options.precachedAssets)
    }
  }

  async #precache() {
    const me = this;
    await me.#precacheURL();
    await me.#precacheAssets();
  }

  #onInstall(event) {
    const me = this;
    me.trace('Service Worker installing:', event);
    event.waitUntil(me.#precache());
  }

  #onActivate(event) {
    const me = this;
    me.trace('Service Worker activated:', event);
    if (me.#options?.preload) event.waitUntil(me.#enableNavigationPreload());
    return self.clients.claim();
  }

  /**
   *  {type: 'NOTIFICATION', data: {title, body, icon, actions}}
   *  {type: 'NOTIFICATION_WAITING'}
   */
  #onPush(event) {
    const me = this;
    me.trace('Push message received:', event);

    // format {type, data}
    const payload = event.data?.json();
    let options = null;

    if (payload?.type === 'NOTIFICATION') {
      options = payload?.data;
    }

    if (payload?.type === 'NOTIFICATION_WAITING') {
      options = me.#notificationOptions;
    }

    if (options) {
      //event.waitUntil(me.#handleNotification(me.#notificationOptions));
      me.#handleNotification(me.#notificationOptions);
    }
  }

  #onSync(event) {
    this.trace('Sync message received:', event);
  }

  /**
   * Intercept fetch events and respond with cached resources if they match the filter.
   * @param {*} event 
   * @returns 
   */
  #onFetch(event) {
    const me = this;

    // Check if the request matches any filter
    if (!me.#filter.match(event.request)) {
      me.trace('Fetch filter skip for:', event.request.url);  
      return;
    } 
    
    me.trace('Fetch event for:', event.request.url);

    event.respondWith(
      me.#cache.cacheFirst(event.request, event)
    );
  }

  /**
   * Handle messages from clients based on message channel.
   * @param {*} event 
   */
  #onPortMessage(event) {
    if (this.#trace) {
      me.trace('Client message received on port:', event);
      event.target?.postMessage(`Hi client: ${event.data} from Service Worker Port2`);
    }
  }

  /**
   * Handle messages from clients or other sources.
   * This method is called when a message is received by the service worker.
   * @param {MessageEvent} event 
   */
  #onMessage(event) {
    const me = this;
    if (me.#isSelf(event)) return;

    me.#handleTrace(event);

    // handle worker update
    if (event.data === 'SKIP_WAITING') {
      return self.skipWaiting();
    }

    if (event.data === 'CLEAR_CACHE') {
      event.waitUntil( me.#cache.clearCache() );
      return;
    }

    // handle worker update notification
    if (event.data === 'NOTIFICATION_WAITING') {
      event.waitUntil(
        me.#handleNotification(me.#notificationOptions)
      );
      return;
    }

    if (me.#handleChannel(event)) return;

    // TODO: Handle other message types

  }

  #onMessageError(event) {
    this.#trace("Message deserialization failed:", event);
  }

  async #onNotification(event) {
    //const payload = event.notification.data;
    if (event.action === 'refresh') {
      this.trace('Notification action: Refresh');
      self.registration?.waiting?.postMessage('SKIP_WAITING');
      /*
      const clients =  await self.clients.matchAll();
      clients.forEach(client => client.navigate(client.url));
      */
    }
  }

  // Check if the event source is the service worker itself
  #isSelf(event) {
    return event.source === self.serviceWorker;
  }

  // Enable navigation preload
  async #enableNavigationPreload() {
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
  }

  #handleTrace(event) {
    const me = this;
    if (event?.data === 'TRACE_ON') {
      me.#trace = true;
      console.log('Service Worker trace enabled');
    } else if (event?.data === 'TRACE_OFF') {
      me.#trace = false;
      console.log('Service Worker trace disabled');
    }

    if (me.#trace) {
      me.trace('Service Worker message received:', event);
      // 
      event.source?.postMessage(`Hi client: ${event.data} from Service Worker`);
    }
  }

  #handleChannel(event) {
    const me = this;
    if (event?.data === 'INIT_PORT' && event?.ports[0]) {
      me.trace('Client port init :', event);
      event.ports[0].onmessage = me.#onPortMessage.bind(me);
      return true;
    }
  }

  async #handleNotification(options) {
    const me = this;
    me.trace('Notification received:', options);
    if (options) {
      return self.registration.showNotification(options.title, options);
    }
  }

  trace(message, data = '') {
    if (this.#trace) {
      console.log(message, data);
    }
  }

  static create(options) {
    return new WorkerEngine(options);
  }
}