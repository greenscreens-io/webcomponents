/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { html } from '../lib.mjs';

/**
 * Generic object property descritptor getter
 * @param {Object} instance 
 * @returns {PropertyDescriptor}
 */
function descriptors(instance) {
  return Object.entries(Object.getOwnPropertyDescriptors(instance));
}

/**
 * List of all object property descriptors 
 * @param {Object} instance Object instance 
 * @returns {Array<PropertyDescriptor>}
 */
function listProperties(instance) {
  return descriptors(instance)
    .filter(e => typeof e[1].value !== 'function')
    .map(e => e[0]);
}

/**
 * List all object property getters
 * @param {Object} instance 
 * @returns {Array}
 */
function listGetters(instance) {
  return descriptors(Reflect.getPrototypeOf(instance))
    .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
    .map(e => e[0]);
}

/**
 * List of all getteble properties from an object
 * @param {Object} instance 
 * @returns {Array}
 */
function listGettable(instance) {
  return new Set([...listGetters(instance), ...listProperties(instance)]);
}

/**
 * Parse string literal template into Lit html instance
 * @param {*} tpl 
 * @param {*} params 
 * @returns {function}
 */
export function literalTemplate(tpl, params) {
  const names = Array.from(listGettable(params));
  const vals = names.map(v => params[v]);
  names.push('html');
  vals.push(html);
  return new Function(...names, `return html\`${tpl}\`;`)(...vals);
}