import {
    Component,
    TemplateRef,
    Input,
    ContentChild,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    HostListener,
    HostBinding,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import { OfVirtualTree } from './virtual-tree.model';
import { VirtualRenderArea } from '../../models';

@Component({
    selector: 'of-virtual-tree',
    template: `
        <ng-content select="[tree-before]"></ng-content>
        <div class="vt-bottom-space" [style.top.px]="totalHeight"></div>
        <div class="vt-container" [style.top.px]="topBuffer">
            <ng-template ngFor [ngForOf]="visibleItems" [ngForTemplate]="template"></ng-template>
        </div>
        <ng-content select="[tree-after]"></ng-content>
    `,
    styles: [
        `
            :host {
                outline: none;
                display: block;
                height: 100%;
                overflow: auto;
                position: relative;
            }
            .vt-container {
                min-width: 100%;
            }
            .vt-container,
            .vt-bottom-space {
                position: absolute;
            }
            .vt-bottom-space {
                width: 1px;
                height: 1px;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfVirtualTreeComponent implements OnDestroy, AfterViewInit {
    private disposers: (() => void)[] = [];
    private _model!: OfVirtualTree<any>;
    private renderArea = new VirtualRenderArea();

    /**
     * @ignore
     */
    @HostBinding('tabIndex')
    public tabIndex = 0;

    /**
     * @ignore
     */
    public visibleItems: any[] = [];

    /**
     * @ignore
     */
    @ContentChild(TemplateRef)
    public template!: TemplateRef<any>;

    /**
     * An instance of an OfVirtualTree<T> configured to your dataset
     */
    @Input()
    public set model(value: OfVirtualTree<any>) {
        this._model = value;
        this.listenForDataChange(value);
    }
    public get model() {
        return this._model;
    }

    /**
     * Height each item in the tree
     */
    @Input()
    public set itemHeight(value: number) {
        this.renderArea.itemHeight = value;
    }
    public get itemHeight() {
        return this.renderArea.itemHeight;
    }

    /**
     * @ignore
     */
    public get topBuffer() {
        return this.renderArea.topBuffer;
    }

    /**
     * @ignore
     */
    public get totalHeight() {
        return this.renderArea.totalHeight;
    }

    constructor(private cdr: ChangeDetectorRef, private element: ElementRef<HTMLDivElement>) {}

    /**
     * @ignore
     */
    public ngAfterViewInit() {
        this.handleDataChange();
        this.invalidateSize();
        this.syncScrollPos();
    }
    /**
     * @ignore
     */
    public ngOnDestroy() {
        this.dispose();
    }

    /**
     * @ignore
     */
    @HostListener('keydown', ['$event'])
    public handleKeydown(evt: KeyboardEvent) {
        if (evt.key === 'Enter') {
            this.model.selectHighlightedItem();
        } else if (evt.key.startsWith('Arrow')) {
            const direction = evt.key.replace('Arrow', ''),
                nextHighlightedIndex = this.model.navigate(direction);

            if (nextHighlightedIndex !== undefined) {
                this.scrollToIndex(nextHighlightedIndex);
            }
            evt.preventDefault();
        }
    }

    /**
     * @ignore
     */
    @HostListener('scroll')
    public handleScrollChange() {
        if (this.element.nativeElement) {
            this.renderArea.scrollPos = this.element.nativeElement.scrollTop;
            this.updateVisibleItems();
        }
    }

    /**
     * @ignore
     */
    @HostListener('window:resize')
    public handleWindowResize() {
        this.invalidateSize();
    }

    /**
     * Fix issues occurring from tree container's height has changed
     */
    public invalidateSize() {
        if (this.element.nativeElement) {
            const bounds = this.element.nativeElement.getBoundingClientRect();
            this.renderArea.viewerHeight = bounds.height;
            if (this.renderArea.itemCount !== this.visibleItems.length) {
                this.updateVisibleItems();
            }
        }
    }

    /**
     * Scroll the container until the selected item is in view. If the selected item is already in view, do nothing.
     */
    public scrollToSelected() {
        const selectedIndex = this.model.getSelectedIndex();
        if (typeof selectedIndex === 'number') {
            this.scrollToIndex(selectedIndex);
        }
    }

    /**
     * Scroll to a certain position
     * @param offset In pixels, the scroll position to jump to
     */
    public scrollTo(offset: number) {
        const { nativeElement } = this.element;
        if (nativeElement) {
            nativeElement.scrollTop = offset;
        }
    }

    /**
     * Scroll the container until the item is in view. If the item is already in view, do nothing.
     */
    public scrollToItem(item: any) {
        const selectedIndex = this.model.getItemIndex(item);
        if (typeof selectedIndex === 'number' && selectedIndex > -1) {
            this.scrollToIndex(selectedIndex);
        }
    }

    /**
     * Scroll the container until the item at the index is in view. If the item at the index is already in view, do nothing.
     */
    public scrollToIndex(index: number) {
        const { nativeElement } = this.element;
        if (nativeElement) {
            const { viewerHeight, itemHeight } = this.renderArea,
                itemTop = index * itemHeight,
                itemBottom = itemTop + itemHeight;

            if (itemTop < nativeElement.scrollTop) {
                nativeElement.scrollTop = itemTop;
            } else if (itemBottom > nativeElement.scrollTop + viewerHeight) {
                nativeElement.scrollTop = itemBottom - viewerHeight;
            }
        }
    }

    /**
     * Get the current scroll offset, pixels
     */
    public getScrollPos() {
        return this.renderArea.scrollPos;
    }

    /**
     * Adjust the DOM scroll position to match the VirtualRenderArea scroll postion, and vice versa.
     * This can fix some issues that occur after DOM height changes
     */
    public syncScrollPos() {
        const { nativeElement } = this.element;
        if (nativeElement) {
            if (nativeElement.scrollTop !== this.renderArea.scrollPos) {
                nativeElement.scrollTop = this.renderArea.scrollPos;
                this.renderArea.scrollPos = nativeElement.scrollTop;
            }
        }
    }

    private listenForDataChange(model: OfVirtualTree<any>) {
        this.dispose();
        const subscription = model.onDataInvalidated.subscribe(() => this.handleDataChange());
        this.disposers.push(() => subscription.unsubscribe());
    }

    private dispose() {
        for (const disposer of this.disposers) {
            disposer();
        }
    }

    private handleDataChange() {
        this.renderArea.itemCount = this.model.items.length;
        this.updateVisibleItems();
        this.cdr.detectChanges();
    }

    private updateVisibleItems() {
        this.visibleItems = this.model.items.slice(
            this.renderArea.visibleStart,
            this.renderArea.visibleStart + this.renderArea.visibleCount
        );
    }
}
