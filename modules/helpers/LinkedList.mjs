/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { NEXT, PREV } from '../base/GSConst.mjs';

/*
const list = new LinkedList(1);
list.append(2).append(3).append(4);
*/

/**
 * Node data holder
 */
export class LinkedList {

    #value = null;
    #next = null;
    #previous = null;

    constructor(value) {
        this.#value = value;
    }

    [NEXT](val) {
        this.#next = val;
    }

    [PREV](val) {
        this.#previous = val;
    }

    remove() {
        const me = this;
        me.#previous?.[NEXT](me.#next);
        me.#next?.[PREV](me.#previous);
        return me.#release();
    }

    delete() {
        return this.remove();
    }
    
    /**
     * Append node after 
     * @param {*} node 
     */
    append(node) {

        node = LinkedList.wrap(node);
        node.#next = this.#next;
        node.#previous = this;
        this.#next = node;
        return node;
    }

    add(node) {
        return this.append(node);
    }

    /**
     * Insert node before
     * @param {*} node 
     */
    insert(node) {
        node = LinkedList.wrap(node);
        node.#previous = this.#previous;
        node.#next = this;
        this.#previous = node;
        return node;
    }

    update(val) {
        this.#value = val;
        return this;
    }

    find(cb) {
        return this.iterator.find(cb);
    }

    filter(cb) {
        return this.iterator.filter(cb);
    }

    map(cb) {
        return this.iterator.map(cb);
    }

    forEach(cb) {
        for (let n of this.iterator) {
            cb(n, -1, this);
        }
    }
    
    every(cb) {
        let result = undefined;
        for (let n of this.iterator) {
            result = cb(n, -1, this);
            if (result) break;
        }
        return result;
    }

    toArray(values = true) {
        return values ? this.asValues : this.asNodes;
    }

    toJSON() {
        return this.value;
    }

    /**
     * Use internally only or make sure node is deatached
     */
    #release() {
        this.#value = undefined;
        this.#next = undefined;
        this.#previous = undefined;
        return this;
    }
        
    get head() {
        return this.previous?.head || this;
    }

    get tail() {
        return this.next?.tail || this;
    }

    get next() {
        return this.#next;
    }

    get previous() {
        return this.#previous;
    }

    get value() {
        return this.#value;
    }

    set value(val) {
        this.#value = val;
    }    

    get asValues() {
        return [...this].map(v => v.value);
    }

    get asNodes() {
        return [...this];
    }
    
    get iterator() {
        return this[Symbol.iterator]();
    }

    *[Symbol.iterator]() {
        yield this;
        if (this.#next) yield* this.#next.iterator;        
    }

    static wrap(node) {
        return node instanceof LinkedList ? node : new LinkedList(node);
    }
    
}
