/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSReadWrite } from "./ReadWrite.mjs";
import { GSReadWriteRegistry } from "./ReadWriteRegistry.mjs";
import { TreeNode } from "./TreeNode.mjs";

/**
 * A module loading GSTreeReader class
 * @module base/GSEvent
 */

/**
 * Generic Class for reading Tree nodes
 * @Class
 */
export class GSTreeReader extends GSReadWrite {

    #data = TreeNode.root;

    /**
     * Instance constructor
     * @param {string} name Unique handler name
     * @param {boolean} enabled Automatically registe in global registry. 
     */
    constructor(name, enabled) {
        super(name, enabled);
    }

    async write(val) {
        throw new Error('Writer not available for TreeReader')
    }

    async read(owner) {
        const me = this;
        let node = undefined;
        const data = await super.read(owner);
        if (!this.#data) {
            node = TreeNode.from(data);
            this.#data = node;
        } else {
            const parent = me.filter?.length > 0 ? me.#data.findByKey(me.filter[0]) : me.#data;
            parent.clear();
            node = parent.fromJSON(data);
        }
        me.filter = undefined;
        me.notify(owner, 'read', node);
        return node;
    }

    disable() {
        super.disable();
        this.#data?.release();
    }

    notify(owner, type, data, error) {
        const isNode = data instanceof TreeNode;
        if (!error && !isNode && type === 'read') return;
        super.notify(owner, type, data, error);
    }

    /**
     * Called from Tree when node is expanded 
     * @param {*} node 
     */
    async onExpand(node) {
        if (node.hasChildren) return;
        node.loading();
        this.filter = node.key;
        return await this.read();
    }

    get data() {
        return this.#data;
    }

    /**
     * Reset the tree data
     */
    resetData() {
        this.#data = TreeNode.root;
    }

    /**
     * Register generic handler under unique name.
     * @param {string} name Unique handler name
     * @returns {GSTreeReader} Data handler instance
     */
    static register(name) {
        return new GSTreeReader(name, true);
    }

    static {
        GSReadWriteRegistry.addHandler('tree', GSTreeReader);
    }

}