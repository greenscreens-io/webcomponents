/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { Tree } from "../helpers/Tree.mjs";

/**
 * A module loading TreeNode class
 * @module data/TreeNode
 */

/**
 * UI mediator between Tree linked nodes and WebComponents
 * @Class
 */
export class TreeNode extends Tree {

    #multi = false;
    #opened = false;
    #focused = false;
    #selected = false;
    
    #focusedNode = undefined;
    #selectedNode = undefined;
    #controllers = undefined;

    constructor(key, value = key, parent = null, level = 0) {
        super(key, value, parent, level);

        if (value?.select === true || (this.multi && parent?.selected)) this.selected = true;
        if (value?.focus === true) this.focused = true;
        if (value?.open === true) this.opened = true;
    }

    addController(controller) {
        const root = this.root;
        (root.#controllers ??= new Set()).add(controller);
    }

    removeController(controller) {
        this.root.#controllers?.delete(controller);
    }

    /**
     * Is multi selection available
     */
    get multi() {
        return this.root.#multi === true;
    }

    set multi(val) {
        this.root.#multi = val === true;
    }

    get visible() {
        if (this.level < 0) return true;
        return this.parent?.opened;
    }

    /**
     * select single node, removing seelction flag from all other nodes
     */
    get opened() {
        if (this.level < 0) return true;
        return this.isLeaf ? this.parent?.opened : this.#opened;
    }

    set opened(val) {
        val = val === true;
        if (val) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    /**
     * Focus single node, removing focus flag from all other nodes
     */
    get focused() {
        return this.#focused;
    }

    set focused(val) {
        val = val === true;
        const root = this.root;
        const changed = this.#focused != val;
        const focusedNode = root.focusedNode();
        
        root.#focusedNode = undefined;        
        this.#focused = val;
        if (focusedNode && focusedNode !== this) {
            focusedNode.focused = false;
        }

        if (val) root.#focusedNode = this;
        if (changed) root.#controllers?.forEach((c) => c.onFocusChanged?.(this));
    }

    /**
     * Select single or multi node, depending on multi selection flag
     * If single, remove selection flag from all other nodes
     */
    get selected() {
        return this.#selected;
    }

    set selected(val) {
        val = val === true;
        const root = this.root;
        const selectedNode = root.selectedNode();
        const changed = this.#selected != val;
        this.#selected = val;
        if (val) {
            if (selectedNode && selectedNode !== this && !root.multi) {
                selectedNode.selected = false;
            }
            root.#selectedNode = this;
        }
        if (changed) {
            root.#controllers?.forEach((c) => c.onSelectionChanged?.(this, selectedNode));
            if (root.multi) root.#controllers?.forEach((c) => c.onSelectionChanged?.(this.parent, selectedNode));
        } 
    }

    get isPartialySelected() {
        return this.selected && this.hasChildren && this.nodes.length > this.nodes.filter(n => n.selected).length;
    }

    /* hide from public
    get host() {
        return this[Symbol.for('gs-element')];
    }

    set host(el) {
        this[Symbol.for('gs-element')] = el;
    }
    */

    selectAll() {
        const root = this.root;
        if (!root.multi) {
            this.deselectAll();
            this.selected = true;
            return
        }
        this.#selectionFlag(true);
        root.#selectedNode = this;
        root.#controllers?.forEach((c) => c.onSelectAll?.(root));
    }

    deselectAll() {
        const root = this.root;
        this.#selectionFlag(false);
        root.#selectedNode = undefined;
        root.#controllers?.forEach((c) => c.onDeselectAll?.(root));
    }

    /**
     * Return last focused node
     * @returns 
     */
    focusedNode() {
        const node = this.root.#focusedNode;
        return node?.focused ? node : undefined;
    }

    /**
     * Return last selected node
     * @returns 
     */
    selectedNode() {
        const node = this.root.#selectedNode;
        return node?.selected ? node : undefined;
    }

    /**
     * List all selected nodes.
     * @returns 
     */
    selectedNodes() {
        const root = this.root;
        if (!root.multi) {
            const node = root.selectedNode()
            return node?.selected ? [node] : [];
        }
        return Array.from(root.walk().filter(o => o.selected));
    }

    /**
     * Call from external controller data must be refresshed (to notify UI optionally)
     * @param {*} root 
     */
    refresh(root) {
        root = root || this.root;
        root.#controllers?.forEach((c) => c.onRefresh?.(this));
    }

    /**
     * Notify controllers about data loading (from async controller)
     * @param {*} root 
     */
    loading(root) {
        root = root || this.root;
        root.#controllers?.forEach((c) => c.onLoad?.(this));
    }

    expandAll(root) {
        const me = this;
        root = root || me.root;
        for (let node of this.walk()) {
            if (!node.isLeaf) node.expand(root);
        }
    }

    collapseAll(root) {
        const me = this;
        root = root || me.root;
        for (let node of this.walk()) {
            if (!node.isLeaf) node.collapse(root);
        }
    }

    expand(root) {
        const me = this;
        root = root || me.root;
        if (!me.parent?.opened) {
            me.parent?.expand(root);
        }
        const update = !me.opened;
        me.#opened = true;
        if (update) me.#expanded(root);
        //me.nodes?.filter( n => !n.opened).forEach(c => c.refresh(root));
        me.nodes?.forEach(c => c.refresh(root));
    }

    collapse(root) {
        const me = this;
        root = root || me.root;
        const update = me.#opened || me.parent.#opened;
        me.nodes?.filter(n => n.opened || n.parent.opened).forEach(o => o.collapse(root));
        //me.nodes?.forEach(o => o.collapse(root));
        me.#opened = false;
        if (update) me.#collapsed(root);
    }

    select(val = true) {
        this.selected = val === true;
    }

    #expanded(root) {
        root.#controllers?.forEach((c) => c.onExpand?.(this));
    }

    #collapsed(root) {
        root.#controllers?.forEach((c) => c.onCollapse?.(this));
    }

    release() {
        if (this.#selected) this.selected = false;
        super.release();
    }

    append(key, value = key) {
        const me = this;
        const node = super.append(key, value);
        if (node) me.root.#controllers?.forEach((c) => c.onAppend?.(me, node));
        return node;
    }

    insert(parentNodeKey, key, value = key) {
        const me = this;
        const node = super.insert(parentNodeKey, key, value);
        if (node) me.root.#controllers?.forEach((c) => c.onInsert?.(me, node));
        return node;
    }

    remove() {
        const node = super.remove();
        if (node) this.root.#controllers?.forEach((c) => c.onInsert?.(node));
        return node;
    }

    #selectionFlag(val = false) {
        val = val === true
        for (let node of this.walk()) {
            node.selected = val;
        }
    }

    /**
     * Load JSON data into tree
     * @param {*} data 
     */
    fromJSON(data) {
        if (data) TreeNode.from(this, data);
        return this;
    }

    /**
     * Used by JSON.stringify to properly export as JSON
     * @returns 
     */
    toJSON() {
        if (this.level < 0) return this.nodes?.map(o => o.toJSON()) || {};
        const obj = Object.assign({
            key: this.key,
            opened: this.#opened,
            focused: this.#focused,
            selected: this.#selected,
            items: undefined
        }, this.value);
        obj.items = this.nodes?.map(o => o.toJSON());
        return obj;
    }

    /**
     * Reset the tree node
     */
    reset() {
        this.#multi = false;
        this.#opened = false;
        this.#focused = false;
        this.#selected = false;
        this.#focusedNode = undefined;
        this.#selectedNode = undefined;
        this.#controllers = undefined;
    }

    static get root() {
        return new TreeNode(null, null, null, -1);
    }

    /**
     * Convert JSON tree into Linked Tree 
     * @param {*} data 
     * @returns 
     */
    static from(parent, data) {
        const raw = data || parent;
        const hasParent = parent instanceof TreeNode;
        if (Array.isArray(raw)) {
            if (!hasParent) return TreeNode.from(TreeNode.root, raw);
            raw.forEach(o => TreeNode.from(parent, o));
            return parent;
        }
        const { items, ...obj } = raw;
        obj.leaf = !Array.isArray(items);
        const tree = new TreeNode(obj.key, obj, data ? parent : undefined);
        if (items) TreeNode.from(tree, items);
        if (hasParent) parent.append(tree);
        return tree;
    }

}