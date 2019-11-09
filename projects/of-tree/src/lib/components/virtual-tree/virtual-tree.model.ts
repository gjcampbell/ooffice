import { EventEmitter } from '@angular/core';
import { Node, TreeQuery, TreeQueryConfig } from '../../models';

export interface TreeConfig<ItemType> {
    canExpand?: (item: ItemType) => boolean;
    childAccessor?: (item: ItemType) => ItemType[] | undefined;
    lazyLoad?: boolean;
}

export class VirtualTree<ItemType> {
    private expandedItems = new Set<ItemType>();
    private highlighted?: ItemType;
    private selectedItem?: ItemType;
    private _query: TreeQuery<ItemType>;
    private filter?: (item: ItemType) => boolean;

    public onDataInvalidated = new EventEmitter();
    public onSelectionChanged = new EventEmitter<ItemType>();
    public onHighlightChanged = new EventEmitter<ItemType>();

    public items: Node<ItemType>[] = [];

    public get query() {
        return this._query;
    }

    constructor(private config: TreeConfig<ItemType>, query?: TreeQuery<ItemType>) {
        if (query) {
            this._query = query;
        } else {
            this._query = new TreeQueryConfig<ItemType>(this.config.childAccessor, !this.config.lazyLoad).query([]);
        }
    }

    public updateConfig(value: TreeConfig<ItemType>) {
        this.config = value;
    }

    public isFiltered() {
        return this.filter !== undefined;
    }

    public isSelected(item: ItemType) {
        return this.selectedItem === item;
    }

    public isExpanded(item: ItemType) {
        return this.expandedItems.has(item);
    }

    public isHighlighted(item: ItemType) {
        return this.highlighted === item;
    }

    public highlightByIndex(index: number | undefined) {
        const item = index === undefined || this.items[index] === undefined ? undefined : this.items[index].item;
        this.highlight(item);
    }

    public getSelectedIndex() {
        const selectedNode = this.selectedItem ? this.query.findNode(this.selectedItem) : undefined,
            result = selectedNode ? this.items.indexOf(selectedNode) : undefined;
        return result;
    }

    public getItemIndex(item: ItemType) {
        const node = this.query.findNode(item);
        return node ? this.items.indexOf(node) : -1;
    }

    /**
     * Get the TreeQuery's node for the passed item
     * @param item item for which to get the node
     */
    public getTreeNode(item: ItemType) {
        return this.query.findNode(item);
    }

    /**
     * Set the currently highlighted item
     * @param item item to select
     */
    public select(item: ItemType) {
        if (this.selectedItem !== item) {
            this.selectedItem = item;
            this.onSelectionChanged.emit(item);
        }
    }

    /**
     * Set the currently highlighted item
     * @param item item to highlight, undefined to unset the highlighted item
     */
    public highlight(item: ItemType | undefined) {
        if (this.highlighted !== item) {
            this.highlighted = item;
            this.onHighlightChanged.emit(item);
        }
    }

    /**
     * Set the passed item as the currently selected and highlighted item
     * @param item item to select & highlight
     */
    public selectAndHighlight(item: ItemType) {
        this.select(item);
        this.highlight(item);
    }

    /**
     * Get the item that is currently selected
     */
    public getSelectedItem() {
        return this.selectedItem;
    }

    /**
     * Get the item that is currently highlighted
     */
    public getHighlightedItem() {
        return this.highlighted;
    }

    /**
     * Selects the highlighted node, and toggles its expand state
     */
    public selectHighlightedItem() {
        let didChange = false;
        if (this.highlighted) {
            this.toggle(this.highlighted);
            didChange = this.selectedItem !== this.highlighted;
            this.select(this.highlighted);
        }

        return didChange;
    }

    /**
     * Expand all ancestry of the currently selected item
     */
    public expandToSelectedItem() {
        if (this.selectedItem) {
            this.expandToItem(this.selectedItem);
            this.invalidateData();
        }
    }

    /**
     * Expand all ancestry of the passed item
     * @param item item to expand to
     */
    public expandToItem(item: ItemType) {
        const node = this.query.findNode(item);
        if (node) {
            for (const parent of node.ancestors()) {
                if (!parent.isRoot) {
                    this.expandedItems.add(parent.item);
                }
            }
        }
    }

    /**
     * Toggle the expanded state of the passed item
     * @param item item to toggle
     */
    public toggle(item: ItemType) {
        if (this.isExpandable(item)) {
            if (this.isExpanded(item)) {
                this.expandedItems.delete(item);
            } else {
                this.expandedItems.add(item);
            }
            this.invalidateData();
        }
    }

    /**
     * Set the expanded state of an item. This does nothing if the item is not expandable or already in the desired state
     * This does not update the UI. Expect to call invalidateData/invalidateItem to see the effect.
     * @param item item to expanded or collapse
     * @param expanded true to expand, false to collapse
     */
    public setExpanded(item: ItemType, expanded: boolean) {
        if (this.isExpandable(item)) {
            const isExpanded = this.isExpanded(item);
            if (isExpanded && !expanded) {
                this.expandedItems.delete(item);
            } else if (!isExpanded && expanded) {
                this.expandedItems.add(item);
            }
        }
    }

    public expandAll() {
        for (const node of this.query) {
            if (this.isExpandable(node.item)) {
                this.expandedItems.add(node.item);
            }
        }
        this.invalidateData();
    }

    public collapseAll() {
        this.expandedItems.clear();
        this.invalidateData();
    }

    /**
     * Apply a filter that ignore expand state and makes visible all nodes that either
     * match the predicate or contain a child that matches the predicate
     * @param filter predicate, true to make a node visible
     */
    public setFilter(filter: undefined | ((item: ItemType) => boolean)) {
        this.filter = filter;
        this.invalidateData();
    }

    /**
     * Returns true if the passed item is expandable
     * @param item item to check
     */
    public isExpandable(item: ItemType) {
        let result = false;

        if (!this.filter && this.config.canExpand) {
            result = this.config.canExpand(item);
        } else {
            const node = this.query.findNode(item);
            result = !!node && node.hasChildren;
        }

        return result;
    }

    /**
     * Update data from the root
     * @param items Data to load
     */
    public load(items: ItemType[]) {
        this._query = new TreeQueryConfig<ItemType>(this.config.childAccessor, !this.config.lazyLoad).query(items);
        this.invalidateData();
    }

    /**
     * Signal children to be reloaded for a particular node.
     * Has no effect if the passed parent has not been loaded
     * @param parent item to reload
     */
    public reloadChildren(parent: ItemType) {
        const node = parent ? this.query.findNode(parent) : this.query.getRootNode();
        if (node) {
            node.invalidateChildren(!this.config.lazyLoad);
            this.invalidateData();
        }
    }

    /**
     * Signal the tree to reload all data
     */
    public reloadTree() {
        const root = this.query.getRootNode();
        root.invalidateChildren(!this.config.lazyLoad);
        this.invalidateData();
    }

    /**
     * Change the highlighted node by the given direction.
     * 'Left' will collapse before navigation.
     * 'Right' will expand before navigation.
     * @param direction 'Left' | 'Up' | 'Down' | 'Right'
     */
    public navigate(direction: string | 'Left' | 'Right' | 'Up' | 'Down') {
        const selectedNode = this.highlighted ? this.query.findNode(this.highlighted) : undefined,
            index = selectedNode ? this.items.indexOf(selectedNode) : undefined;
        let nextSelectedIndex;

        if (direction === 'Up') {
            nextSelectedIndex = index === undefined ? this.items.length - 1 : index === 0 ? undefined : index - 1;
        } else if (
            direction === 'Down' ||
            (direction === 'Right' && this.highlighted && (!this.isExpandable(this.highlighted) || this.isExpanded(this.highlighted)))
        ) {
            nextSelectedIndex = index === undefined ? 0 : index === this.items.length - 1 ? undefined : index + 1;
        } else if (direction === 'Left' && selectedNode) {
            if (this.highlighted && this.isExpanded(this.highlighted)) {
                this.toggle(this.highlighted);
                nextSelectedIndex = index;
            } else if (selectedNode.parent) {
                nextSelectedIndex = this.items.indexOf(selectedNode.parent);
            }
        } else if (direction === 'Right') {
            if (this.highlighted && !this.isExpanded(this.highlighted)) {
                this.toggle(this.highlighted);
                nextSelectedIndex = index;
            }
        }

        this.highlightByIndex(nextSelectedIndex);
        return nextSelectedIndex;
    }

    /**
     * Signal that the state has changed and the tree needs to be revisited
     */
    public invalidateData() {
        if (this.filter) {
            this.items = this.query
                .descend()
                .hasDescendant(this.filter)
                .toArray();
        } else {
            this.items = this.query
                .forwardOverride((curr, fallback) =>
                    !curr.isRoot && !this.isExpanded(curr.item) ? curr.next || curr.ancestorForward() : fallback()
                )
                .whereNode(n => this.isExpanded(n.parent!.item) || n.parent!.isRoot)
                .toArray();
        }

        this.onDataInvalidated.emit();
    }

    /**
     * Signal that the children of a node have changed and the node needs to have the children reloaded
     * @param item item whose children should be reloaded
     * @param reloadImmediately true to update children immediate, not on-demand
     */
    public invalidateItem(item: ItemType, reloadImmediately = true) {
        if (item) {
            const node = this.getTreeNode(item);
            if (node) {
                node.invalidateChildren(reloadImmediately);
                this.invalidateData();
            }
        }
    }
}
