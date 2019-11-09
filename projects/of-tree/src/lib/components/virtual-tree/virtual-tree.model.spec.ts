import { OfVirtualTree } from './virtual-tree.model';

interface Item {
    id: number;
    children?: Item[];
}

describe('OfVirtualTree', () => {
    const createVt = (data: Item[]) => {
            const result = new OfVirtualTree<Item>({ childAccessor: (item: Item) => item.children });
            result.load(data);
            return result;
        },
        navigate = (vt: OfVirtualTree<Item>, ...directions: string[]) => {
            const result: (number | undefined)[] = [];
            for (const dir of directions) {
                vt.navigate(dir);
                const highlighted = vt.getHighlightedItem();
                result.push(highlighted ? highlighted.id : undefined);
            }
            return result;
        },
        dummyData = [
            {
                id: 1,
                children: [
                    {
                        id: 2
                    }
                ]
            },
            {
                id: 3
            },
            {
                id: 4,
                children: [
                    {
                        id: 5,
                        children: [
                            {
                                id: 6
                            }
                        ]
                    }
                ]
            }
        ];

    it('can navigate up', () => {
        const vt = createVt(dummyData);

        expect(navigate(vt, 'Up', 'Up', 'Up', 'Up')).toEqual([4, 3, 1, undefined]);

        vt.expandAll();
        expect(navigate(vt, 'Up', 'Up', 'Up', 'Up', 'Up', 'Up', 'Up')).toEqual([6, 5, 4, 3, 2, 1, undefined]);
    });

    it('can navigate down', () => {
        const vt = createVt(dummyData);

        expect(navigate(vt, 'Down', 'Down', 'Down', 'Down')).toEqual([1, 3, 4, undefined]);

        vt.expandAll();
        expect(navigate(vt, 'Down', 'Down', 'Down', 'Down', 'Down', 'Down', 'Down')).toEqual([1, 2, 3, 4, 5, 6, undefined]);
    });

    it('can navigate right', () => {
        const vt = createVt(dummyData),
            commands = ['Down', 'Right', 'Right', 'Right', 'Right', 'Right', 'Right', 'Right', 'Right', 'Right'],
            highlightSequence = [1, 1, 2, 3, 4, 4, 5, 5, 6, undefined];

        expect(navigate(vt, ...commands)).toEqual(highlightSequence);
    });

    it('can navigate left', () => {
        const vt = createVt(dummyData),
            commands = ['Up', 'Left', 'Left', 'Left', 'Left', 'Up', 'Up', 'Left', 'Left', 'Left'],
            highlightSequence = [6, 5, 5, 4, 4, 3, 2, 1, 1, undefined];

        vt.expandAll();
        expect(navigate(vt, ...commands)).toEqual(highlightSequence);
    });
});
