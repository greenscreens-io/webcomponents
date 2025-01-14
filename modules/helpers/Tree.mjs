/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * Tree Node data holder
 */
export class Tree {

    value;

    #key = null;
    #parent = null;
    #children;

    #folder = false;
    #level = 0;

    constructor(key, value = key, parent = null, level = 0) {
        this.#key = key;
        this.#parent = parent;
        this.#folder = value?.leaf === false;
        this.#level = parent ? parent.level + 1 : level;
        this.#children = this.#folder ? [] : undefined;
        this.value = value;
    }

    /**
     * Return tree list from root to this node.
     * TODO: Refactor when iterator "map" become available
     */
    get subtree() {
        return Array.from(this.up(undefined, false, true, true));
    }

    get levelID() {
        return this.subtree.map(o => o.level).join('.');
    }

    /**
     * Unique node canonical form
     */
    get nodeID() {
        //if (this.parent?.level < 0) return this.index;
        return this.subtree.map(o => o.index).join('.');
    }

    get path() {
        return this.subtree.map(o => o.key).join('/');
    }

    get index() {
        return this.parent?.nodes.indexOf(this) || 0;
    }

    get size() {
        return this.#children?.length || -1;
    }

    get level() {
        return this.#level;
    }

    /**
     * Check if node is main root node 
     */
    get isRoot() {
        return this.parent ? false : true;
    }

    /**
     * Check if #children is empty
     */
    get isLeaf() {
        return !this.#folder;
    }

    get isFolder() {
        return this.#folder;
    }

    /**
     * Check if has #childrens
     */
    get hasChildren() {
        return this.#folder && this.size > 0;
    }

    /**
     * Get parent node, readonly
     */
    get key() {
        this.#key ??= this.nodeID;
        return this.#key;
    }

    get nodes() {
        return this.#children;
    }

    /**
     * Get parent node, readonly
     */
    get parent() {
        return this.#parent;
    }

    /**
     * Get main root node
     */
    get root() {
        return this.parent?.root || this;
    }

    /**
     * Check if there are more siblings 
     */
    get hasMore() {
        return this.#parent?.size > this.index + 1;
    }

    get firstChild() {
        return this.hasMore ? this.#children[0] : undefined;
    }

    get lastChild() {
        return this.hasMore ? this.#children[this.#children.length - 1] : undefined;
    }

    get next() {
        return this.down(this, false, false).next().value || this.nextSibling || this.parent?.nextSibling;
    }

    get previous() {
        const node = this.previousSibling;
        return (node?.hasChildren) ? node.lastChild : node || this.up(this, false, false).next().value;
    }

    get nextSibling() {
        return this.hasMore ? this.#parent.#children[this.index + 1] : undefined;
    }

    get previousSibling() {
        return this.index > 0 ? this.#parent.#children[this.index - 1] : undefined;
    }

    /**
     * Clear all #children
     */
    clear() {
        if (this.#children) {
            this.#children.forEach(o => o.release?.());
            this.#children = [];
        }
    }

    /**
     * Used internally, if called externally, 
     * make sure node is removed from parent 
     */
    release() {
        this.clear();
        this.#key = null;
        this.value = null;
        this.#parent = null;
    }

    /**
     * Walk down the tree
     * @param {Tree} node starting node
     * @param {Boolean} values yield values instead nodes
     * @param {Boolean} inclusive include self
     * @param {Boolean} reverse Order direction
     * @param {Boolean} flat Navigate all nodes out of subtree
     */
    *down(node = this, values = false, inclusive = true, reverse = false, flat = false) {
        const o = values ? node.value : node;
        if (inclusive && !reverse && node.level > -1) yield o;
        if (node.#children?.length) {
            for (let child of node.#children) {
                yield* this.down(child, values, true, reverse, flat);
            }
        }
        if (flat) {
            const item = node.nextSibling || node.parent.nextSibling;
            if (item) yield* this.down(item, values, true, reverse, flat);
        }
        /*
        */
        if (inclusive && reverse && node.level > -1) yield o;
    }

    /**
     * Walk up the tree
     * @param {Tree} node starting node
     * @param {Boolean} values yield values instead nodes
     * @param {Boolean} inclusive include self
     * @param {Boolean} reverse Order direction
     */
    *up(node = this, values = false, inclusive = true, reverse = false, flat = false) {
        const o = values ? node.value : node;
        if (inclusive && !reverse && node.level > -1) yield o;
        if (flat) {
            let item = node.previousSibling;
            item = item?.isFolder ? item.lastChild : item
            if (item) yield* this.up(item, values, true, reverse, flat);
        }        
        if (node.parent) {
            yield* this.up(node.parent, values, true, reverse, flat);
        }
        if (inclusive && reverse && node.level > -1) yield o;
    }

    /**
     * Walk through all nodes
     * @param {*} node 
     */
    walk = this.down;

    /**
     * Simulate array function "forEach"
     * @param {*} callback 
     * @param {*} flat If set, will iterate all nodes, otherwise only cildrens and subtrees
     * @param {*} reverse If set, will iterate up the tree
     * @returns 
     */
    forEach(callback, flat = false, reverse = false) {
        this.every((node, index) => {
            callback(node, index);
            return true;
        }, flat, reverse);
    }

    /**
     * Simulate array function "every"
     * @param {*} callback 
     * @param {*} flat If set, will iterate all nodes, otherwise only cildrens and subtrees
     * @param {*} reverse If set, will iterate up the tree
     * @returns 
     */    
    every(callback, flat = false, reverse = false) {
        const it = this.iterate(flat, reverse);
        let sts = true;
        let i = 0;
        for (let node of it) {
            sts = callback(node, i++);
            if (!sts) break;
        }
        return sts;
    }

    /**
     * Simulate array function "find"
     * @param {*} callback 
     * @param {*} flat If set, will iterate all nodes, otherwise only cildrens and subtrees
     * @param {*} reverse If set, will iterate up the tree
     * @returns 
     */    
    find(callback, flat = false, reverse = false) {
        const it = this.iterate(flat, reverse);
        let i = 0;
        for (let node of it) {
            if (callback(node, i++)) return node;
        }
        return undefined;
    }

    /**
     * Simulate array function "filter"
     * @param {*} callback 
     * @param {*} flat If set, will iterate all nodes, otherwise only childrens and subtrees
     * @param {*} reverse If set, will iterate up the tree
     * @returns 
     */    
    filter(callback, flat, reverse) {
        return [...this.#filtered(callback, flat, reverse)];
    }

    *#filtered(callback, flat, reverse) {
        const it = this.iterate(flat, reverse);
        for (let node of it) {
            let res = callback(node);
            if (res) yield node;
        }        
    }

    /**
     * Iterate all nodes
     * @param {boolean} flat If set, will iterate all nodes, otherwise only cildrens and subtrees
     * @param {boolean} reverse If set, will iterate up the tree
     */
    *iterate(flat, reverse) {
        reverse ? yield* this.up(this, false, false, false, flat) : yield* this.down(this, false, false,  false, flat);
    }

    /**
     * Add a new Tree to the tree.
     * @param {*} key 
     * @param {*} value 
     * @returns 
     */
    append(key, value = key) {
        let newOne = undefined;
        if (key instanceof Tree) {
            key.#parent = this;
            key.#level = this.#level + 1;
            newOne = key;
        } else {
            newOne = new Tree(key, value, this);
        }
        this.#folder = true;
        this.#children ??= [];
        this.#children.push(newOne);
        return newOne;
    }

    /**
     * Uses the walk() method and Array.prototype.push() 
     * to add a new Tree to the tree.
     * @param {*} parentNodeKey 
     * @param {*} key 
     * @param {*} value 
     * @returns 
     */
    insert(parentNodeKey, key, value = key) {
        for (let node of this.walk()) {
            if (node.key === parentNodeKey) {
                const newOne = new Tree(key, value, node);
                this.#folder = true;
                this.#children ??= [];
                node.#children.push(newOne);
                return newOne;
            }
        }
        return false;
    }

    /**
     * Remove node from tree. If key is set, will search for first node with matching key.
     * @param {*} key 
     * @returns 
     */
    remove(key) {

        const me = this;

        if (key) {
            const node = me.findByKey(key);
            node?.remove();
            return node;
        }

        if (me.isRoot) throw new Error('Root node can\'t be removed!');
        const node = me.parent;
        const filtered = node.#children.filter(c => c !== me);
        if (filtered.length !== node.#children.length) {
            node.#children = filtered;
            return me;
        }

        return false;
    }

    /**
     * Uses the walk() method to retrieve the given node in the tree.
     * @param {*} key 
     * @returns 
     */
    findByKey(key) {
        for (let node of this.walk()) {
            if (node.key === key) return node;
        }
        return undefined;
    }

    /**
     * Convert tree into array list
     * @returns 
     */
    flatten(values, inclusive, reverse) {
        return [...this.down(this, values, inclusive, reverse)];
    }

    /**
     * Load JSON data into tree
     * @param {*} data 
     */
    fromJSON(data) {
        if (data) Tree.from(this, data);
        return this;
    }

    /**
     * Used by JSON.stringify to properly export as JSON
     * @returns 
     */
    toJSON() {
        if (this.level < 0) return this.#children?.map(o => o.toJSON()) || {};
        return this.isLeaf ? { key: this.key, value: this.value } :
            {
                key: this.key,
                value: this.value,
                items: this.#children.map(o => o.toJSON())
            }
    }

    /**
     * Make node iterable
     */
    *[Symbol.iterator]() {
        yield* this.down();
    }

    /**
     * Convert JSON tree into Linked Tree 
     * @param {*} data 
     * @returns 
     */
    static from(parent, data) {
        const raw = data || parent;
        const hasParent = parent instanceof Tree;
        if (Array.isArray(raw)) {
            if (!hasParent) throw new Error('Parent required when data is array');
            raw.forEach(o => Tree.from(parent, o));
            return parent;
        }
        const { items, ...obj } = raw;
        const tree = new Tree(obj.key, obj, data ? parent : undefined);
        if (hasParent) parent.append(tree);
        if (items) Tree.from(tree, items);
        return tree;
    }
}

