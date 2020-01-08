import { Node } from './node';

export class TreeQuery<T> implements Iterable<Node<T>> {
    private rootNode!: Node<T>;
    private nodeLookup = new Map<T, Node<T>>();
    private iterate: () => IterableIterator<Node<T>>;

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

    public hasDescendant(filter: (item: T) => boolean, excludeMatch: boolean = false) {
        return this.hasDescendantNode(n => filter(n.item), excludeMatch);
    }
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

    public count() {
        let result = 0;
        for (const _node of this.iterate()) {
            result++;
        }
        return result;
    }

    public nth(n: number) {
        const result = this.skip(n)
            .take(1)
            .toArray()
            .find(() => true);
        return result;
    }

    public where(filter: (item: T) => boolean) {
        return this.whereNode(n => filter(n.item));
    }

    public first() {
        for (const result of this) {
            return result.item;
        }
        return undefined;
    }

    public ascend(from?: T, wrap?: boolean) {
        const node = (from && this.findNode(from)) || undefined;
        return this.extend(this.reverseIterator(node, wrap));
    }

    public descend(from?: T, wrap?: boolean) {
        const node = (from && this.findNode(from)) || undefined;
        return this.extend(this.forwardIterator(node, wrap));
    }

    public provideNext(provider: (current: Node<T>, defaultNext: () => Node<T> | undefined) => undefined | Node<T>) {
        this.customMove = provider;
        return this;
    }
    public forwardOverride(provider: (current: Node<T>, defaultNext: () => Node<T> | undefined) => undefined | Node<T>) {
        return this.descend()
            .provideNext(provider)
            .descend();
    }

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

    public getRootNode() {
        return this.rootNode;
    }

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

export class TreeConfig<T> {
    constructor(public readonly childAccessor?: (item: T) => T[] | undefined, public eagerLoad = true) {}
    public query(items: T[]) {
        return TreeQuery.init<T>(items, this.childAccessor, this.eagerLoad);
    }
}
