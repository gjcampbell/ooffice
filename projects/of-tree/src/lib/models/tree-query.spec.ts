import { TreeQuery } from './tree-query';

interface Item {
    id: number;
    children?: Item[];
}

describe('TreeQuery', () => {
    const dummyData1 = () => [{ id: 1, children: [{ id: 2 }] }, { id: 3 }, { id: 4, children: [{ id: 5, children: [{ id: 6 }] }] }],
        itemChildAccessor = (item: Item) => item.children,
        createTq = (items: Item[], eagerLoad = true) => TreeQuery.init<Item>(items, itemChildAccessor, eagerLoad);

    it('has a special root node', () => {
        const tq = createTq([{ id: 1 }]),
            root = tq.getRootNode();

        expect(root.isRoot).toBeTruthy();
        expect(root.parent).toBeUndefined();
        expect(root.isLastChild).toBeTruthy();
        expect(root.isFirstChild).toBeTruthy();
        expect(root.hasChildren).toBeTruthy();
        expect(root.item).toEqual({ items: [{ id: 1 }] } as any);
    });

    it(`keeps a lookup of each data item's nodes`, () => {
        const items = [{ id: 1 }],
            tq = createTq(items);

        expect(tq.findNode(items[0])!.item).toEqual({ id: 1 });
        expect(tq.findNode(items[0])!.item).toBe(items[0]);
        expect(tq.findNode(items[0])!.item).toBe(items[0]);
        expect(tq.findNode(items[0])!.isRoot).toBeFalsy();
    });

    it('stores the parent of a node', () => {
        const child = { id: 2 },
            tq = createTq([{ id: 1, children: [child] }]);

        expect(tq.findNode(child)!.parent!.item.id).toBe(1);
    });

    it('stores the previous sibling of a node', () => {
        const subject = { id: 2 },
            tq = createTq([{ id: 1 }, subject]);

        expect(tq.findNode(subject)!.prev!.item.id).toBe(1);
    });

    it('stores the next sibling of a node', () => {
        const subject = { id: 1 },
            tq = createTq([subject, { id: 2 }]);

        expect(tq.findNode(subject)!.next!.item.id).toBe(2);
    });

    it('stores children of a node', () => {
        const subject = { id: 2 },
            parent = { id: 1, children: [subject] },
            tq = createTq([parent]);

        expect(tq.findNode(parent)!.children[0].item).toBe(subject);
    });

    it('provides ancestors as iterable nearest to furthest', () => {
        const subject = { id: 4 },
            tq = createTq([{ id: 1, children: [{ id: 2, children: [{ id: 3, children: [subject] }] }] }]);

        expect([...tq.findNode(subject)!.ancestors()].map(a => a.item.id)).toEqual([3, 2, 1, undefined] as any);
    });

    it('provides sibling-relative index of node', () => {
        const subject1 = { id: 1 },
            subject2 = { id: 2 },
            subject3 = { id: 3 },
            tq = createTq([{ id: 0, children: [subject1, subject2, subject3] }]);

        expect(tq.findNode(subject1)!.index).toBe(0);
        expect(tq.findNode(subject2)!.index).toBe(1);
        expect(tq.findNode(subject3)!.index).toBe(2);
    });

    it('tells whether a node is the first or last among siblings', () => {
        const subject1 = { id: 1 },
            subject2 = { id: 2 },
            tq = createTq([subject1, subject2]);

        expect(tq.findNode(subject1)!.isFirstChild).toBeTruthy();
        expect(tq.findNode(subject1)!.isLastChild).toBeFalsy();
        expect(tq.findNode(subject2)!.isFirstChild).toBeFalsy();
        expect(tq.findNode(subject2)!.isLastChild).toBeTruthy();
    });

    it('can iterate nodes first to last (descending)', () => {
        const tq = createTq(dummyData1());

        expect([...tq.descend()].map(n => n.item.id)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('can iterate nodes last to first (ascending)', () => {
        const tq = createTq(dummyData1());

        expect([...tq.ascend()].map(n => n.item.id)).toEqual([6, 5, 4, 3, 2, 1]);
    });

    it('can filter items', () => {
        const tq = createTq(dummyData1());

        expect([...tq.where(o => o.id % 2 === 1)].map(n => n.item.id)).toEqual([1, 3, 5]);
    });

    it('can chain filters on items', () => {
        const tq = createTq(dummyData1());

        expect([...tq.where(o => o.id % 2 === 1).where(o => o.id < 5)].map(n => n.item.id)).toEqual([1, 3]);
    });

    it('can filter nodes', () => {
        const tq = createTq(dummyData1());

        expect([...tq.whereNode(n => n.hasChildren)].map(n => n.item.id)).toEqual([1, 4, 5]);
    });

    it('can filter nodes and items chained', () => {
        const tq = createTq(dummyData1());

        expect([...tq.where(o => o.id % 2 === 1).whereNode(n => n.hasChildren)].map(n => n.item.id)).toEqual([1, 5]);
    });

    it('allows a custom iterator', () => {
        const tq = createTq(dummyData1()),
            lvlOneOnly = (curr: any, defaultNext: any) => (defaultNext().depth >= 1 ? defaultNext().ancestorForward() : defaultNext());

        expect([...tq.forwardOverride((curr, defaultNext) => defaultNext())].map(n => n.item.id)).toEqual([1, 2, 3, 4, 5, 6]);
        expect([...tq.forwardOverride(lvlOneOnly)].map(n => n.item.id)).toEqual([1, 3, 4]);
    });

    it('can lazy load children', () => {
        let childrenRequests = 0;

        const tq = TreeQuery.init<Item>(
            dummyData1(),
            item => {
                childrenRequests++;
                return item.children;
            },
            false
        );
        expect(childrenRequests).toBe(0);
        expect(tq.getRootNode().childrenLoaded).toBe(false);
        expect(tq.count()).toBe(6);
        expect(childrenRequests).toBe(6);
    });

    it('when lazy loading children, findNode is limited to loaded children', () => {
        const dummyData = dummyData1(),
            tq = createTq(dummyData, false);
        expect(tq.findNode(dummyData[0])).toBeUndefined();

        tq.getRootNode().invalidateChildren(true);
        expect(tq.findNode(dummyData[0])).toBeTruthy();

        expect(tq.count());
        expect(tq.findNode(dummyData[2].children![0])).toBeTruthy();
    });

    it('when children are invalidated, findNode will not find them', () => {
        const tq = createTq(dummyData1()),
            subjectData = tq.where(d => d.id === 4).first();

        const newItem = { id: 7 },
            oldItems = subjectData!.children!;

        subjectData!.children = [newItem];

        expect(tq.findNode(oldItems[0])).toBeTruthy();
        expect(tq.findNode(newItem)).toBeFalsy();

        tq.getRootNode().invalidateChildren(true);

        expect(tq.findNode(oldItems[0])).toBeFalsy();
        expect(tq.findNode(newItem)).toBeTruthy();
    });

    it('does not access children unnecessarily', () => {
        let childrenAccessed = false;
        const dummyData = dummyData1(),
            tq = TreeQuery.init<Item>(
                dummyData,
                (item: any) => {
                    childrenAccessed = true;
                    return item.children;
                },
                false
            ).forwardOverride((curr, defaultNext) => (curr.isRoot ? defaultNext() : curr.depth === 0 ? curr.next : undefined));

        expect([...tq].map(n => n.item.id)).toEqual([1, 3, 4]);
        expect(childrenAccessed).toBeFalsy();
    });
});
