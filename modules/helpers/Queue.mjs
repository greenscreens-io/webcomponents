/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 *  Linear data structure following first in, first out (FIFO) order of operations.
 */
export class Queue extends Array {
    
    enqueue(item) {
        this.push(item);
    }

    dequeue() {
        return this.shift();
    }

    peek() {
        return this[0];
    }

    isEmpty() {
        return this.length === 0;
    }
}