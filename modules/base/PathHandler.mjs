/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Proxy to handle paths
 * const p = PathHandler.wrap('/home/user/demo.txt');
 * p.parent p.name p.path etc.
 */
export default class PathHandler {

  #root = null;
  
  constructor(val) {
    this.#root = val;
  }
  
  get(target, key) {
    if (key === 'hasParent') return target.length > 1;
    if (key === 'path') return target.join('/');
    if (key === 'primitive') return target;
    if (key === 'root') return this.#root;
    if (key === 'name') return target.slice(-1).pop();
    if (key === 'parent') {
      target = target.slice(0, -1);
      return this.#format(target);
    }
    return target[key];
  }

  #format(target) {
    const path = target.length == 0 ? ['/'] : target;
    return new Proxy(path, this);
  }

  static wrap(val) {
    if (typeof val == 'string') val = val.split('/');
    return new Proxy(val, new PathHandler(val));
  }

}
