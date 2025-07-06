/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * CacheEngine class provides a simple interface to manage caching of resources using the Cache API.
 */
export class CacheEngine {

  #name;

  /**
   * Creates an instance of CacheEngine with a specified cache name.
   * @param {*} name 
   */
  constructor(name) {
    if (!('caches' in self)) {
      throw new Error('Cache API is not supported in this browser.');     
    }
    this.#name = name || 'DefaultCache';
  }

  /**
   * Returns the name of the cache.
   */
  get name() {
    return this.#name;
  }
  
  /**
   * Initialize the cache engine.
   * This should be called first before using the cahe engine.
   * @returns 
   */
  async init() {  
    return caches.open(this.#name);
  }

  /**
   * Add resources to cache.
   * @param {*} resources 
   * @returns 
   */
  async addResourcesToCache(resources) {
    const cache = await this.init(); 
    return cache.addAll(resources);
  }

  /**
   * Put the response in cache for the given request.
   * @param {*} request 
   * @param {*} response 
   * @returns 
   */
  async putInCache(request, response) {
    const cache = await this.init();
    return cache.put(request, response);
  }

  /**
   * Get the response from cache for the given request.
   * @param {*} request 
   * @returns 
   */
  async getFromCache(request) {
    const cache = await this.init();
    return cache.match(request);
  }

  /**
   * Fetch resource from network and cache it before returning the result.
   * @param {*} request 
   * @param {*} event
   * @returns 
   */
  async fetchAndCache(request, event) { 
    const me = this;
    const fetchedResponse = await fetch(request);
    if (fetchedResponse.ok) {
      if (event) {
        event.waitUntil(me.putInCache(request, fetchedResponse.clone()));
      } else {
        await me.putInCache(request, fetchedResponse.clone());
      }
    }
    return fetchedResponse;
  }

  /**
   * Get the response from cache first, if not found, 
   * fetch it from network and cache it before returning the result.
   * @param {*} request 
   * @param {*} event 
   * @returns Promise<Response>
   */
  async cacheFirst(request, event) {
    const me = this;

    // Try to get the request from cache first
    const responseFromCache = await me.getFromCache(request);
    if (responseFromCache) return responseFromCache;
    
    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await event?.preloadResponse;
    if (preloadResponse) {
      event.waitUntil(me.putInCache(request, preloadResponse.clone()));
      return preloadResponse;
    }    

    // Finally, fetch from network and cache the response
    return me.fetchAndCache(request, event);
  }

  async clearCache() {
    const cache = await this.init();
    return cache.keys().then(keys => {
      return Promise.all(keys.map(key => cache.delete(key)));
    }); 
  }

}