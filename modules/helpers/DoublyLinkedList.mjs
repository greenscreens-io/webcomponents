/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/*
const list = new DoublyLinkedList();

list.insertFirst(1);
list.insertFirst(2);
list.insertFirst(3);
list.insertLast(4);
list.insertAt(3, 5);

list.size;                      // 5
list.head.value;                // 3
list.head.next.value;           // 2
list.tail.value;                // 4
list.tail.previous.value;       // 5
[...list].map(e => e.value);    // [3, 2, 1, 5, 4]

list.removeAt(1);               // 2
list.getAt(1).value;            // 1
list.head.next.value;           // 1
[...list].map(e => e.value);    // [3, 1, 5, 4]

list.reverse();
[...list].map(e => e.value);    // [4, 5, 1, 3]

list.clear();
list.size;                      // 0
*/

/**
 * Node data holder
 */
export class Node {

    value = null;
    next = null;
    previous = null;

    constructor(value, next = null, previous = null) {
        this.value = value;
        this.next = next;
        this.previous = previous;
    }

    /**
     * Use internally only or make sure node is deatached
     */
    release() {
        this.value = undefined;
        this.next = undefined;
        this.previous = undefined;
    }

    toJSON() {
        return this.value;
    }
}

export class DoublyLinkedList {

    #nodes = [];

    /**
     * Number of elements in the list
     */
    get size() {
        return this.#nodes.length;
    }

    /**
     * First element in the list
     */
    get head() {
        return this.size ? this.#nodes[0] : null;
    }

    /**
     * Last elemet in the list
     */
    get tail() {
        return this.size ? this.#nodes[this.size - 1] : null;
    }

    /**
     * Create new linked node
     * @param {*} value 
     * @param {*} nextNode 
     * @param {*} previousNode 
     * @returns 
     */
    create(value, nextNode, previousNode) {
        return new Node(value, nextNode, previousNode);
    }

    /**
     * Insert data to the given position in the list
     * @param {*} index 
     * @param {*} value 
     * @param {*} safe 
     * @returns 
     */
    insertAt(index, value, safe) {

        if (!this.#validate(index, safe)) return false;

        const previousNode = this.#nodes[index - 1] || null;
        const nextNode = this.#nodes[index] || null;
        const node = create(value, nextNode, previousNode);

        if (previousNode) previousNode.next = node;
        if (nextNode) nextNode.previous = node;
        this.#nodes.splice(index, 0, node);
    }

    /**
     * Insert data to the beginning of the list
     * @param {*} value 
     */
    insertFirst(value) {
        this.insertAt(0, value);
    }

    /**
     * Insert data to the end of the list
     * @param {*} value 
     */
    insertLast(value) {
        this.insertAt(this.size, value);
    }

    /**
     * Retrieves the data in the given index
     * @param {Number} index 
     * @returns 
     */
    getAt(index) {
        return this.#nodes[index];
    }

    indexOf(val) {
        return this.#nodes.indexOf(val);
    }

    /**
     * Remove the data at the given index
     * @param {*} index 
     * @param {*} safe 
     * @returns 
     */
    removeAt(index, safe) {

        if (!this.#validate(index, safe)) return false;

        const previousNode = this.#nodes[index - 1] || null;
        const nextNode = this.#nodes[index + 1] || null;

        if (previousNode) previousNode.next = nextNode;
        if (nextNode) nextNode.previous = previousNode;

        return this.#nodes.splice(index, 1);
    }

    /**
     * Clear list
     */
    clear(full = true) {
        if (full) this.#nodes.forEach(o => o.release());
        this.#nodes = [];
    }

    /**
     * Reverse data order
     */
    reverse() {
        this.#nodes = this.#nodes.reduce((acc, { value }) => {
            const nextNode = acc[0] || null;
            const node = new Node(value, nextNode, null);
            if (nextNode) nextNode.previous = node;
            return [node, ...acc];
        }, []);
    }

    toArray() {
        return this.#nodes.map(e => e.value);
    }

    toJSON() {
        return this.#nodes;
    }

    *[Symbol.iterator]() {
        yield* this.#nodes;
    }

    #validate(index, safe = false) {
        const isInvalid = this.#isInvalidIndex(index);
        if (isInvalid) {
            if (safe) {
                console.log(this.#error());
            } else {
                throw new Error(this.#error());
            }
        }
        return !isInvalid;
    }

    #isInvalidIndex(index) {
        return !Number.isInteger(index) || index < 0 || index > this.size;
    }

    #error() {
        return `Invalid index. Current length is ${this.size}.`;
    }

    /**
     * Convert array to linked list
     * @param {*} data 
     * @returns 
     */
    static from(data) {
        const list = new DoublyLinkedList();
        if (Array.isArray(data)) data.forEach(v => list.insertLast(v));
        return list;
    }
}