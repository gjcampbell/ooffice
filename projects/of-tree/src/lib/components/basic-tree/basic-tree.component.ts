import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { OfVirtualTree, OfTreeConfig, VtVirtualTreeComponent } from '../virtual-tree';
import { Node } from '../../models';

export interface VtItemState<T> {
    isExpanded: (item: T) => boolean;
    isSelected: (item: T) => boolean;
    isHighlighted: (item: T) => boolean;
    isLoading: (item: any) => boolean;
}

export interface VtBasicTreeConfig<T> extends OfTreeConfig<T> {
    filterThrottle: number;
    filterTextMinLength: number;
    itemIcon: string;
    getIcon(item: T, node: Node<T>, state: VtItemState<T>): string;
    getName(item: T, state: VtItemState<T>): string;
    getDomNodeAttr(item: T, node: Node<T>, state: VtItemState<T>): { [attr: string]: any } | undefined;
    canDrag(item: T): boolean;
    canDrop(args: DragArgs<T>): boolean;
    move(args: DragArgs<T>): Promise<void>;
    getDragData(item: T): string;
}

type DragPos = 'before' | 'on' | 'after';

interface DragArgs<T> {
    itemNode?: Node<T>;
    parentNode: Node<T>;
    item: T | any;
    parent?: T;
    index?: number;
}

@Component({
    selector: 'of-basic-tree',
    templateUrl: `./basic-tree.component.html`,
    styleUrls: [`./basic-tree.component.style.scss`]
})
export class OfBasicTreeComponent implements AfterViewInit, OnDestroy {
    private disposers: (() => void)[] = [];
    private filterTextThrottle: any;
    private _filterText: string | undefined = '';
    private loadingItems = new Set<any>();
    private ownId = Math.random().toString();
    private ownDragItem?: Node<any>;
    private dragExpand: { item?: Node<any>; timeout?: number } = {};
    private stateProvider = Object.seal({
        isExpanded: (item: any) => this.model.isExpanded(item),
        isSelected: (item: any) => this.model.isSelected(item),
        isHighlighted: (item: any) => this.model.isHighlighted(item),
        isLoading: (item: any) => this.isItemLoading(item)
    }) as VtItemState<any>;
    private _model: OfVirtualTree<any>;
    private _config = {
        childAccessor: (item: any) => this.getChildren(item),
        getIcon: (item: any) =>
            item.type !== 'Folder' ? item.icon || this.config.itemIcon : this.model.isExpanded(item) ? 'folder-open' : 'folder',
        getName: (item: any) => item.name,
        getDomNodeAttr: () => undefined,
        itemIcon: 'file-text',
        filterThrottle: 500,
        filterTextMinLength: 2,
        lazyLoad: true,
        canDrag: () => false,
        canDrop: () => false,
        move: () => Promise.resolve(),
        getDragData: () => '{}'
    } as VtBasicTreeConfig<any>;
    private hostBox?: ClientRect;

    @ViewChild(VtVirtualTreeComponent)
    public tree!: VtVirtualTreeComponent;

    @Output()
    public selectionChange = new EventEmitter<any>();

    @Output()
    public itemContextMenu = new EventEmitter<{ event: MouseEvent; item: any }>();

    @Output()
    public iconClick = new EventEmitter<{ event: MouseEvent; item: any }>();

    @Output()
    public labelClick = new EventEmitter<{ event: MouseEvent; item: any }>();

    @Output()
    public rowClick = new EventEmitter<{ event: MouseEvent; item: any }>();

    @Input()
    public itemHeight: number;

    public isDraggingOver = false;

    @ViewChild('dragOverlay')
    public dragOverlay?: ElementRef<HTMLDivElement>;

    private childAccessor = (item: any) => item.children;

    @Input()
    public set filter(value: ((item: any) => boolean) | undefined) {
        this.model.setFilter(value);
    }

    @Input()
    public set filterText(value: string | undefined) {
        this.handleFilterTextChange(value);
    }

    @Input()
    public set config(value: Partial<VtBasicTreeConfig<any>>) {
        this.childAccessor = value.childAccessor || this.childAccessor;
        this._config = { ...this._config, ...value, childAccessor: this.config.childAccessor };
        this.model.updateConfig(this.config);
    }
    public get config() {
        return this._config;
    }

    public get isFiltered() {
        return this.model.isFiltered();
    }

    @Input()
    public set model(value: OfVirtualTree<any>) {
        this._model = value;
        this.bindModelEvents();
    }
    public get model() {
        return this._model;
    }

    @Input()
    public set data(items: any[]) {
        this.model.load(items);
    }

    @Input()
    public set selection(value: any) {
        if (!this.model.isSelected(value)) {
            this.model.select(value);
            this.navigateToSelection();
        }
    }

    constructor(private host: ElementRef<HTMLElement>) {
        this._model = new OfVirtualTree<any>(this.config);
        this.bindModelEvents();
        this.itemHeight = 1.5 * parseFloat(window.getComputedStyle(document.body).fontSize || '16');
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.tree.invalidateSize();
            this.model.invalidateData();
        }, 1);
    }

    ngOnDestroy() {
        this.disposeSubscriptions();
    }

    public handleContextMenu(evt: MouseEvent, item: any) {
        this.itemContextMenu.emit({ event: evt, item });
    }

    public handleRowClick(evt: MouseEvent, item: any) {
        this.model.selectAndHighlight(item);
        this.rowClick.emit({ event: evt, item });
    }

    public navigateToSelection() {
        this.model.expandToSelectedItem();
        return this.tree.scrollToSelected();
    }

    public navigateToItem(item: any) {
        this.model.expandToItem(item);
        return this.tree.scrollToItem(item);
    }

    public getIcon(node: Node<any>) {
        return `of-icon fa fa-${this.config.getIcon!(node.item, node, this.stateProvider)}`;
    }

    public getDomNodeAttr(node: Node<any>) {
        return this.config.getDomNodeAttr ? this.config.getDomNodeAttr(node.item, node, this.stateProvider) : undefined;
    }

    public getName(item: any) {
        return this.config.getName!(item, this.stateProvider) || '';
    }

    public getExpanderIcon(item: any) {
        const iconType = this.model.isExpanded(item) ? 'down' : 'right';
        return `fa fa-caret-${iconType}`;
    }

    public handleDragstart(evt: DragEvent, node: Node<any>) {
        this.ownDragItem = node;
        if (this.canDrag(node.item)) {
            if (evt.dataTransfer) {
                evt.dataTransfer.dropEffect = 'move';
                evt.dataTransfer.setData('application/json.of-tree-item', this.getDragData(node.item));
                evt.dataTransfer.setData(`text/plain.${this.ownId}`, '{}');
            }
        }
    }

    @HostListener('dragover', ['$event'])
    public handleDragover(evt: DragEvent) {
        this.isDraggingOver = true;
        if (evt.dataTransfer && evt.dataTransfer.types.includes('application/json.of-tree-item')) {
            const dropInfo = this.getDropInfo(evt, false);
            if (dropInfo.canDrop()) {
                this.adjustDragOverlay(dropInfo);
                evt.preventDefault();
            }
            if (dropInfo.draggedItem !== dropInfo.parent) {
                this.tryDragExpand(dropInfo);
            }
        }
    }

    @HostListener('dragleave')
    public handleDragleave() {
        this.isDraggingOver = false;
    }

    @HostListener('drop', ['$event'])
    public handleDrop(evt: DragEvent) {
        this.isDraggingOver = false;
        if (evt.dataTransfer && evt.dataTransfer.types.includes('application/json.of-tree-item')) {
            const dropInfo = this.getDropInfo(evt, true);
            if (dropInfo.canDrop()) {
                this.move(dropInfo.draggedItem, dropInfo.parent!, dropInfo.index);
            }
        }
    }

    public canDrag(item: any) {
        return this.config.canDrag!(item);
    }

    private tryDragExpand(dropInfo: { parent?: Node<any>; area: DragPos }) {
        if (dropInfo.area !== 'on' || this.dragExpand.item !== dropInfo.parent) {
            clearTimeout(this.dragExpand.timeout);
        }
        if (this.dragExpand.item !== dropInfo.parent && dropInfo.parent && dropInfo.area === 'on') {
            this.dragExpand.item = dropInfo.parent;
            this.dragExpand.timeout = window.setTimeout(() => {
                this.model.setExpanded(dropInfo.parent!.item, true);
                this.model.invalidateData();
            }, 600);
        }
    }

    private async move(item: any, parent: Node<any>, index: number | undefined) {
        if (this.config.move) {
            const itemNode = item instanceof Node ? item : undefined,
                itemData = itemNode ? itemNode.item : item,
                parentItem = parent ? parent.item : undefined,
                fromParent = itemNode && itemNode.parent ? itemNode.parent.item : undefined;

            await this.config.move({
                itemNode,
                parentNode: parent,
                item: itemData,
                parent: parentItem,
                index
            });

            this.model.invalidateItem(fromParent);
            this.model.invalidateItem(parent.item);
        }
    }

    private getDropInfo(evt: DragEvent, readExternalData: boolean) {
        const box = this.getHostBox(),
            boxY = box ? box.top : 0,
            yPos = evt.pageY - boxY,
            target = this.getItemPosition(yPos),
            draggedItem = evt.dataTransfer!.types.includes(`text/plain.${this.ownId}`)
                ? this.ownDragItem
                : readExternalData && evt.dataTransfer
                ? JSON.parse(evt.dataTransfer.getData('application/json.oce-tree-item'))
                : undefined;

        return {
            draggedItem,
            index: target.itemIndex,
            parent: target.item,
            flatIndex: target.flatIndex,
            area: target.area,
            canDrop: () => {
                const item = draggedItem instanceof Node ? draggedItem.item : draggedItem,
                    itemNode = this.model.getTreeNode(item),
                    parentNode = target.item!,
                    parent = target.item ? target.item.item : undefined,
                    index = target.itemIndex;

                return this.canDrop(itemNode, parentNode, item, parent, index);
            }
        };
    }

    private getItemPosition(yPos: number) {
        const scroll = this.tree.getScrollPos(),
            flatIndex = Math.floor((yPos + scroll) / this.itemHeight),
            itemPos = flatIndex * this.itemHeight - scroll,
            buffer = this.itemHeight / 4,
            area: DragPos = itemPos + buffer > yPos ? 'before' : itemPos + this.itemHeight - buffer < yPos ? 'after' : 'on',
            itemAtIndex = this.model.items[flatIndex],
            itemIndex =
                !itemAtIndex || !itemAtIndex.parent
                    ? undefined
                    : area === 'before'
                    ? itemAtIndex.index
                    : area === 'after'
                    ? itemAtIndex.index + 1
                    : undefined,
            item = !itemAtIndex ? undefined : area === 'on' ? itemAtIndex : itemAtIndex.parent;

        return { flatIndex, itemIndex, item, area };
    }

    private getHostBox() {
        if (!this.hostBox && this.host.nativeElement) {
            this.hostBox = this.host.nativeElement.getBoundingClientRect();
            setTimeout(() => (this.hostBox = undefined), 1000);
        }

        return this.hostBox;
    }

    private getDragData(item: any) {
        return this.config.getDragData!(item);
    }

    private canDrop(itemNode: Node<any> | undefined, parentNode: Node<any>, item: any, parent: any, index: number | undefined) {
        if (this.config.canDrop) {
            return this.config.canDrop({ itemNode, parentNode, item, parent, index });
        }
        return false;
    }

    private adjustDragOverlay(dropInfo: { flatIndex: number; index: number | undefined; area: DragPos } | undefined) {
        if (this.dragOverlay && this.dragOverlay.nativeElement) {
            const el = this.dragOverlay.nativeElement;
            if (dropInfo) {
                const buffer = this.itemHeight / 4,
                    baseY = dropInfo.flatIndex * this.itemHeight,
                    y = dropInfo.area === 'before' ? baseY - buffer : dropInfo.area === 'after' ? baseY + this.itemHeight - buffer : baseY,
                    h = dropInfo.area === 'on' ? this.itemHeight : buffer * 2;

                el.style.top = y + 'px';
                el.style.height = h + 'px';
                if (dropInfo.area === 'on') {
                    el.classList.remove('vbt-dragoverlay-between');
                } else {
                    el.classList.add('vbt-dragoverlay-between');
                }
            } else {
                el.style.height = '0px';
            }
        }
    }

    private getChildren(item: any) {
        const result = this.childAccessor(item);
        if (result instanceof Promise) {
            this.loadChildren(item, result);
            return undefined;
        }
        return result;
    }

    private async loadChildren(item: any, childrenPromise: Promise<any>) {
        this.loadingItems.add(item);
        try {
            await childrenPromise;
            this.model.invalidateItem(item);
        } finally {
            this.loadingItems.delete(item);
        }
    }

    private isItemLoading(item: any) {
        return this.loadingItems.has(item);
    }

    private bindModelEvents() {
        const selectionHandler = (item: any) => this.selectionChange.emit(item),
            subscription = this.model.onSelectionChanged.subscribe(selectionHandler);

        this.disposeSubscriptions();
        this.disposers.push(() => subscription.unsubscribe());
    }

    private disposeSubscriptions() {
        this.disposers.forEach(d => d());
    }

    private handleFilterTextChange(value: string | undefined) {
        if (value && value.length > this.config.filterTextMinLength!) {
            this.setTextFilter(value);
        } else {
            this.clearTextFilter();
        }
        this._filterText = value;
    }

    private setTextFilter(value: string) {
        const text = value.toLowerCase();

        clearTimeout(this.filterTextThrottle);
        this.filterTextThrottle = setTimeout(
            () =>
                this.model.setFilter(
                    item =>
                        this.getName(item)
                            .toLowerCase()
                            .indexOf(text) >= 0
                ),
            this.config.filterThrottle
        );
    }

    private clearTextFilter() {
        if (this._filterText && this._filterText.length > this.config.filterTextMinLength!) {
            clearTimeout(this.filterTextThrottle);
            this.model.setFilter(undefined);
            this.model.expandToSelectedItem();
            this.tree.scrollToSelected();
        }
    }
}
