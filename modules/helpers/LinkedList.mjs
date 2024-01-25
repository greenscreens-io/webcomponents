/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

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

    constructor(value, next = null, previous = null) {
        this.#value = value;
        this.#next = next;
        this.#previous = previous;
    }

    remove() {
        this.#previous.#next = this.#next;
        this.#next.#previous = this.#previous;
        this.#release();
    }

    /**
     * Append node after 
     * @param {*} node 
     */
    append(node) {
        node = this.#wrap(node);
        node.#next = this.#next;
        node.#previous = this;
        this.#next = node;
        return node;
    }

    /**
     * Insert node before
     * @param {*} node 
     */
    insert(node) {
        node = this.#wrap(node);
        node.#previous = this.#previous;
        node.#next = this;
        this.#previous = node;
        return node;
    }

    update(val) {
        this.#value = val;
        return this;
    }

    #wrap(node) {
        return node instanceof LinkedList ? node : new LinkedList(node);
    }

    /**
     * Use internally only or make sure node is deatached
     */
    #release() {
        this.#value = undefined;
        this.#next = undefined;
        this.#previous = undefined;
    }

    toJSON() {
        return this.#value;
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

    static isNode(val) {
        return val instanceof LinkedList;
    }

    /**
     * Convert array to linked list
     * @param {*} data 
     * @returns 
     */
    static from(data) {
        if (!Array.isArray(data)) return null;
        const root = new LinkedList();
        data.reduce((node, val, idx) => idx === 1 ? root.update(node).append((val)) : node.append(val));
        return root;
    }
}
