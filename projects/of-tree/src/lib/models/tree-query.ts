import { Node } from './node';

/**
 * Wraps arbitrary hierarchical data in a tree structure with depth, parent, children
 * sibling properties, normalizing hierarchical data so that it can be traversed and
 * queried easily.
 */
export class TreeQuery<T> implements Iterable<Node<T>> {
    private rootNode!: Node<T>;
    private nodeLookup = new Map<T, Node<T>>();
    private iterate: () => IterableIterator<Node<T>>;

    /**
     * Create a tree query, starting with an arbitrary data set, and a delegate for loading child items
     * @param items Any arbitrary array of data
     * @param childAccessor A delegate which, given an arbitrary data item, should return that items children, or undefined if the item has no children
     * @param eagerLoad If true, will descend the entire items hierarchy immediately
     */
    public static init<T>(items: T[], childAccessor?: (item: T) => T[] | undefined, eagerLoad: boolean = true) {
        const query = new TreeQuery<T>(),
            rootItem = { items } as any,
            accessor = childAccessor || (() => [] as T[]);

        const createNode = (item: T, depth: number, parent?: Node<T>, prev?: Node<T>, index?: number): Node<T> => {
            let providedChildren: Node<T>[] = [];
            const childProvider = () => {
                    const childItems = item === rootItem ? rootItem.items : accessor(item),
                        children = [];

                    query.cleanLookup(providedChildren);

                    if (childItems) {
                        let previous: Node<T> | undefined;
                        for (let i = 0; i < childItems.length; i++) {
                            const childItem = childItems[i],
                                // tslint:disable-next-line: no-use-before-declare
                                child = createNode(childItem, depth + 1, result, previous, i);

                            children.push(child);
                            previous = child;
                        }
                    }

                    return (providedChildren = children);
                },
                result = new Node<T>(prev, parent, depth, item, index || 0, childProvider);

            query.nodeLookup.set(item, result);
            result.invalidateChildren(eagerLoad);

            return result;
        };

        query.rootNode = createNode(rootItem, -1);

        return query;
    }

    private customMove: (current: Node<T>, defaultNext: () => Node<T> | undefined) => Node<T> | undefined = (_current, def) => def();

    private constructor(iterator?: () => IterableIterator<Node<T>>) {
        this.iterate = iterator ? iterator : this.forwardIterator();
    }

    private extend(iterator: () => IterableIterator<Node<T>>): TreeQuery<T> {
        const result = new TreeQuery<T>(iterator);
        result.rootNode = this.rootNode;
        result.nodeLookup = this.nodeLookup;
        return result;
    }

    /**
     * Pagination-like, skip past a number of items. Iterarting will not yield that number of items
     * @param count Number of items to skip through
     */
    public skip(count: number) {
        const iterator = this.iterate;
        return this.extend(function*() {
            let i = 0;
            for (const node of iterator()) {
                if (i >= count) {
                    yield node;
                }
                i++;
            }
        });
    }

    /**
     * Pagination-like, iterate through an exact number of items. Iteration ends after that number is reached
     * @param count Number of items to iterate through
     */
    public take(count: number) {
        const iterator = this.iterate;
        return this.extend(function*() {
            let i = 0;
            for (const node of iterator()) {
                if (i >= count) {
                    break;
                }
                yield node;
                i++;
            }
        });
    }

    /**
     * Apply filter by node, so that only nodes passing the filter are yielded during iteration
     * @param filter A delegate returning bool, true if the node should be iterable
     */
    public whereNode(filter: (node: Node<T>) => boolean) {
        const iterator = this.iterate;
        return this.extend(function*() {
            for (const node of iterator()) {
                if (filter(node)) {
                    yield node;
                }
            }
        });
    }

    /**
     * Apply a filter by item which yields the nodes which have descendants matching the filter
     * @param filter A delegate returning bool, true if its ancestors should be iterable
     * @param excludeMatch False to yield items that match the filter
     */
    public hasDescendant(filter: (item: T) => boolean, excludeMatch: boolean = false) {
        return this.hasDescendantNode(n => filter(n.item), excludeMatch);
    }

    /**
     * Apply a filter by node which yields the nodes which have descendants matching the filter
     * @param filter A delegate returning bool, true if its ancestors should be iterable
     * @param excludeMatch False to yield items that match the filter
     */
    public hasDescendantNode(filter: (node: Node<T>) => boolean, excludeMatch: boolean = false) {
        const iterator = this.iterate,
            self = this;

        return this.extend(function*() {
            const matches = new Set<Node<T>>();
            for (const node of self.ascend()) {
                if (!matches.has(node) && filter(node)) {
                    if (!excludeMatch) {
                        matches.add(node);
                    }
                    for (const p of node.ancestors()) {
                        matches.add(p);
                    }
                }
            }

            for (const node of iterator()) {
                if (matches.has(node)) {
                    yield node;
                }
            }
        });
    }

    /**
     * Get the number of items in the hierarchy
     */
    public count() {
        let result = 0;
        for (const _node of this.iterate()) {
            result++;
        }
        return result;
    }

    /**
     * Get a single item at the given index
     * @param n The overall index of the item in the hierarchy
     */
    public nth(n: number) {
        const result = this.skip(n)
            .take(1)
            .toArray()
            .find(() => true);
        return result;
    }

    /**
     * Apply filter by item, so that only items passing the filter are yielded during iteration
     * @param filter A delegate returning bool, true if the node should be iterable
     */
    public where(filter: (item: T) => boolean) {
        return this.whereNode(n => filter(n.item));
    }

    /**
     * Get the first item
     */
    public first() {
        for (const result of this) {
            return result.item;
        }
        return undefined;
    }

    /**
     * Visit items in the hierarchy in order from top to bottom regardless of depth
     * @param from Where to start ascending from
     * @param wrap True to start back at the last item after reach the root 0th item
     */
    public ascend(from?: T, wrap?: boolean) {
        const node = (from && this.findNode(from)) || undefined;
        return this.extend(this.reverseIterator(node, wrap));
    }

    /**
     * Depth first, visit items in the hierarchy in order from top to bottom
     * @param from Where to start descending from
     * @param wrap True to start back at the root 0th item after reaching the last item
     */
    public descend(from?: T, wrap?: boolean) {
        const node = (from && this.findNode(from)) || undefined;
        return this.extend(this.forwardIterator(node, wrap));
    }

    /**
     * Control descend behavior and skip iterating branches
     * @param provider A delegate which accepts the current node and should return the node to follow
     */
    public provideNext(provider: (current: Node<T>, defaultNext: () => Node<T> | undefined) => undefined | Node<T>) {
        this.customMove = provider;
        return this;
    }
    /**
     * Control descend behavior and override any preexisting descend behavior
     * @param provider A delegate which accepts the current node and should return the node to follow
     */
    public forwardOverride(provider: (current: Node<T>, defaultNext: () => Node<T> | undefined) => undefined | Node<T>) {
        return this.descend()
            .provideNext(provider)
            .descend();
    }

    /**
     * Convenience method for iterating and returning the iterated items as an array
     */
    public toArray() {
        const result = [];
        for (const item of this) {
            result.push(item);
        }
        return result;
    }

    /**
     * @ignore
     */
    public [Symbol.iterator](): Iterator<Node<T>> {
        return this.iterate();
    }

    /**
     * Get the root node of this tree. The root node is a container of other nodes.
     */
    public getRootNode() {
        return this.rootNode;
    }

    /**
     * O(1) return the node of the passed item, or undefined if the item is not loaded in this hierarchy
     * @param item
     */
    public findNode(item: T) {
        return this.nodeLookup.get(item);
    }

    private reverseIterator(from?: Node<T>, wrap?: boolean) {
        const self = this;
        return function*() {
            const start = from || self.rootNode.lastDescendant();
            let current: Node<T> | undefined = start,
                defaultNext: Node<T> | undefined;
            const nextAccessor = () => defaultNext || (defaultNext = current!.reverseNode(wrap));

            while (!!current) {
                if (!current.isRoot) {
                    yield current;
                }
                current = self.customMove(current, nextAccessor);
                defaultNext = undefined;
                if (current === start) {
                    break;
                }
            }
        };
    }

    private forwardIterator(from?: Node<T>, wrap?: boolean) {
        const self = this;
        return function*() {
            const start = from || self.rootNode;
            let current: Node<T> | undefined = start,
                defaultNext: Node<T> | undefined;
            const nextAccessor = () => defaultNext || (defaultNext = current!.forwardNode(wrap));

            while (!!current) {
                if (!current.isRoot) {
                    yield current;
                }
                current = self.customMove(current, nextAccessor);
                defaultNext = undefined;
                if (current === start) {
                    break;
                }
            }
        };
    }

    private cleanLookup(nodes: Node<T>[]) {
        for (const node of nodes) {
            node.visitSubtree(n => this.nodeLookup.delete(n.item));
        }
    }
}

/** @ignore */
export class TreeConfig<T> {
    constructor(public readonly childAccessor?: (item: T) => T[] | undefined, public eagerLoad = true) {}
    public query(items: T[]) {
        return TreeQuery.init<T>(items, this.childAccessor, this.eagerLoad);
    }
}
