/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * FilterEngine class provides a simple interface to manage filters for fetch requests.
 * It allows registering and unregistering functions that can be used to match requests against specific criteria.
 */
export class FilterEngine {

  #filters = new Map();
  #ignores = new Map();

  constructor(filters, nocache) {
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
        me.register(filter.name, filter.fn, filter.ignore);
      } else if (filter.rule instanceof RegExp) {
        me.register(filter.name, me.#regexFilter(filter), filter.ignore);
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

  register(name, filter, ignore = false) {
    const me = this;
    if (me.#filters.has(name)) {
      console.warn(`Filter with name ${name} already exists.`);
      return;
    }
    if (ignore) {
      me.#ignores.set(name, filter);
    } else {
      me.#filters.set(name, filter);
    }
  }

  unregister(name) {
    const me = this;
    if (!me.#filters.has(name)) {
      console.warn(`Filter with name ${name} does not exist.`);
      return;
    }
    me.#filters.delete(name);
  }

  match(request) {

    for (const filter of this.#ignores.values()) {
      if (filter(request)) {
        return false; 
      }
    }

    for (const filter of this.#filters.values()) {
      if (filter(request)) {
        return true;
      }
    }
    return false;
  }
}