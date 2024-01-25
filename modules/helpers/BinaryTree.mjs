/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/*
const tree = new BinaryTree(1, 'AB');

tree.insert(1, 11, 'AC');
tree.insert(1, 12, 'BC');
tree.insert(12, 121, 'BG', { right: true });

[...tree.preOrderTraversal()].map(x => x.value);
// ['AB', 'AC', 'BC', 'BCG']

[...tree.inOrderTraversal()].map(x => x.value);
// ['AC', 'AB', 'BC', 'BG']

tree.value;                // 'AB'
tree.hasChildren;          // true

tree.find(12).isLeaf;           // false
tree.find(121).isLeaf;          // true
tree.find(121).parent.value;    // 'BC'
tree.find(12).left;             // null
tree.find(12).right.value;      // 'BG'

tree.remove(12);

[...tree.postOrderTraversal()].map(x => x.value);
// ['AC', 'AB']
*/

/**
 * Binary Tree Node data holder
 */
export class BinaryTreeNode {

    constructor(key, value = key, parent = null) {
        this.key = key;
        this.value = value;
        this.parent = parent;
        this.left = null;
        this.right = null;
    }

    /**
     * Check if both left and right are empty.
     */
    get isLeaf() {
        return this.left === null && this.right === null;
    }

    /**
     * Check if node has children
     */
    get hasChildren() {
        return !this.isLeaf;
    }

    /**
     * Check if node is main root node 
     */
    get isRoot() {
        return this.parent ? false : true;
    }

    /**
     * Get main root node
     */
    get root() {
        return this.parent?.root || this;
    }

}

/**
 * Binary tree implementation
 */
export class BinaryTree extends BinaryTreeNode {

    constructor(key, value = key) {
        super(key, value);
    }

    /**
     * Generator method that traverses the binary tree in in-order, 
     * using the yield* syntax to recursively delegate traversal to itself.
     * @param {BinaryTreeNode} node 
     */
    *inOrderTraversal(node = this) {
        if (node.left) yield* this.inOrderTraversal(node.left);
        yield node;
        if (node.right) yield* this.inOrderTraversal(node.right);
    }

    /**
     * Generator method that traverses the binary tree in post-order, 
     * using the yield* syntax to recursively delegate traversal to itself.
     * @param {BinaryTreeNode} node 
     */
    *postOrderTraversal(node = this) {
        if (node.left) yield* this.postOrderTraversal(node.left);
        if (node.right) yield* this.postOrderTraversal(node.right);
        yield node;
    }

    /**
     * Generator method that traverses the binary tree in pre-order, 
     * using the yield* syntax to recursively delegate traversal to itself.
     * @param {BinaryTreeNode} node 
     */
    *preOrderTraversal(node = this) {
        yield node;
        if (node.left) yield* this.preOrderTraversal(node.left);
        if (node.right) yield* this.preOrderTraversal(node.right);
    }

    /**
     * Uses the preOrderTraversal() method to find the given parent node and 
     * insert a new child BinaryTreeNode either as the left or right child, 
     * depending on the passed options object.
     * @param {*} parentNodeKey 
     * @param {*} key 
     * @param {*} value 
     * @param {*} options 
     * @returns {boolean} Return true if data inserted
     */
    insert(
        parentNodeKey,
        key,
        value = key,
        { left, right } = { left: true, right: true }
    ) {
        for (let node of this.preOrderTraversal()) {
            if (node.key === parentNodeKey) {
                const canInsertLeft = left && node.left === null;
                const canInsertRight = right && node.right === null;
                if (!canInsertLeft && !canInsertRight) return false;
                if (canInsertLeft) {
                    node.left = new BinaryTreeNode(key, value, node);
                    return true;
                }
                if (canInsertRight) {
                    node.right = new BinaryTreeNode(key, value, node);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Uses the preOrderTraversal() method to remove a BinaryTreeNode from the binary tree.
     * @param {*} key 
     * @returns 
     */
    remove(key) {
        for (let node of this.preOrderTraversal()) {
            if (node.left.key === key) {
                node.left = null;
                return true;
            }
            if (node.right.key === key) {
                node.right = null;
                return true;
            }
        }
        return false;
    }

    /**
     * Uses the preOrderTraversal() method to retrieve the given node in the binary tree.
     * @param {*} key 
     * @returns 
     */
    find(key) {
        for (let node of this.preOrderTraversal()) {
            if (node.key === key) return node;
        }
        return undefined;
    }
}