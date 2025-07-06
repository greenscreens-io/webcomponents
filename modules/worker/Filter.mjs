/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * FilterEngine class provides a simple interface to manage filters for fetch requests.
 * It allows registering and unregistering functions that can be used to match requests against specific criteria.
 */
export class FilterEngine {

  #filters = new Map();

  constructor(filters) {
    this.registerAll(filters);
  }

  registerAll(filters = []) {
    const me = this;
    for (const filter of filters) {
      if (typeof filter.name !== 'string') {
        console.warn('Invalid filter format. Expected { name: string, fn: function }');
        continue;
      }

      if (typeof filter.rule === 'string') {
        filter.rule = new RegExp(filter.rule);
      }

      if (filter.fn) {
        me.register(filter.name, filter.fn);
      } else if (filter.rule instanceof RegExp) {
        me.register(filter.name, me.#regexFilter(filter));
      }
    }
  }

  #regexFilter(filter) {
    const rule = filter.rule;
    const parsed = filter.parsed ? true : false;
    return (request) => {
      rule.lastIndex = 0;
      return parsed ?
        rule.test(URL.parse(request.url).pathname.toLowerCase())
        :
        rule.test(request.url.toLowerCase());
    };
  }

  register(name, filter) {
    if (this.#filters.has(name)) {
      console.warn(`Filter with name ${name} already exists.`);
      return;
    }
    this.#filters.set(name, filter);
  }

  unregister(name) {
    if (!this.#filters.has(name)) {
      console.warn(`Filter with name ${name} does not exist.`);
      return;
    }
    this.#filters.delete(name);
  }

  match(request) {
    for (const [name, filter] of this.#filters.entries()) {
      if (filter(request)) {
        return true;
      }
    }
    return false;
  }
}