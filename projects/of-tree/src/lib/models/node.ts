export class Node<T> {
    private _next?: Node<T>;
    private _childrenAccessor: () => Node<T>[];
    private _children?: Node<T>[];

    /**
     * The forward sibling to this node
     */
    public get next() {
        return this._next;
    }
    public get childrenLoaded() {
        return !!this._children;
    }
    /**
     * The children of this node
     */
    public get children(): ReadonlyArray<Node<T>> {
        return this._children ? this._children : (this._children = this._childrenAccessor());
    }
    /**
     * Bool indicating whether this node has children
     */
    public get hasChildren() {
        return !!this.children.length;
    }
    /**
     * Bool indicating whether this is the last among its siblings
     */
    public get isLastChild() {
        return !this.next;
    }
    /**
     * Bool indicating whether this is the first among its siblings
     */
    public get isFirstChild() {
        return !this.prev;
    }
    /**
     * Bool indicating if this is a root node
     */
    public get isRoot() {
        return !this.parent;
    }
    /**
     * Gets the first of this node's children
     */
    public get firstChild(): Node<T> | undefined {
        return this.children[0];
    }
    /**
     * Gets the last of this node's children
     */
    public get lastChild(): Node<T> | undefined {
        return this.children[this.children.length - 1];
    }
    /**
     * Creates an iterator of this node's ancestors nearest first
     */
    public ancestors(): IterableIterator<Node<T>> {
        const self = this;
        return (function*() {
            let current: Node<T> | undefined = self;
            while ((current = current.parent) !== undefined) {
                yield current;
            }
        })();
    }

    /**
     * Get the root node of this node
     */
    public getRoot() {
        let node: Node<T> | undefined = this;
        while (node && !node.isRoot) {
            node = node.parent;
        }
        return node;
    }

    /**
     * Get the nearest next sibling among ancestor nodes
     */
    public ancestorForward() {
        let result;
        for (const ancestor of this.ancestors()) {
            if (ancestor.next) {
                result = ancestor.next;
                break;
            } else if (ancestor.isRoot) {
                result = ancestor;
                break;
            }
        }
        return result;
    }

    /**
     * Get the nearest next node.
     * If this is the last of its siblings, the nearest ancestor's next sibling is returned.
     * If wrap is true and if this is the last node of the tree, the root is next.
     * If wrap is false and if this is the last node of the tree, undefined is next.
     * If next is this node, then undefined is returned.
     * @param wrap if true, then the root node is returned for the last node of the tree
     */
    public forwardNode(wrap?: boolean): Node<T> | undefined {
        let next: Node<T> | undefined = this.firstChild || this.next;

        if (!next) {
            next = this.ancestorForward();
        }

        if (next && next.isRoot && !wrap) {
            next = undefined;
        }

        return next === this ? undefined : next;
    }

    public reverseNode(wrap?: boolean): Node<T> | undefined {
        let next: Node<T> | undefined = this.prev ? this.prev.lastDescendant() : this.parent;
        if (!next && wrap) {
            const root = this.getRoot();
            next = root ? root.lastDescendant() : undefined;
        }

        return next === this ? undefined : next;
    }

    public lastDescendant(): Node<T> | undefined {
        let result: Node<T> | undefined = this,
            current: Node<T> | undefined = this;
        while ((current = current.lastChild) !== undefined) {
            result = current;
        }
        return result;
    }

    public invalidateChildren(reloadNow: boolean) {
        this._children = undefined;
        if (reloadNow) {
            this._children = this._childrenAccessor();
        }
    }

    public visitSubtree(visitor: (node: Node<T>) => void) {
        visitor(this);
        if (this.childrenLoaded) {
            for (const child of this.children) {
                child.visitSubtree(visitor);
            }
        }
    }

    constructor(
        /**
         * The previous sibling of this node
         */
        public readonly prev: Node<T> | undefined,
        /**
         * The parent node of this node
         */
        public readonly parent: Node<T> | undefined,
        /**
         * The depth of this node or the number of its ancestors
         */
        public readonly depth: number,
        /**
         * The data item which this node wraps
         */
        public readonly item: T,
        /**
         * Index relative to the parent
         */
        public readonly index: number,
        children: () => Node<T>[]
    ) {
        if (prev) {
            prev._next = this;
        }
        this._childrenAccessor = children;
    }
}
