/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 *  Linear data structure following last in, first out (LIFO) order of operations.
 */
export class Stack extends Array {
    
    push(item) {
        this.unshift(item);
    }

    pop() {
        return this.shift();
    }

    peek() {
        return this[0];
    }

    isEmpty() {
        return this.length === 0;
    }
}
