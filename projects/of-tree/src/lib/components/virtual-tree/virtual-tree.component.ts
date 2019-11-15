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
import { VirtualTree } from './virtual-tree.model';
import { VirtualRenderArea } from '../../models';

@Component({
    selector: 'of-virtual-tree',
    template: `
        <ng-content select="[tree-before]"></ng-content>
        <div class="of-bottom-space" [style.top.px]="totalHeight"></div>
        <div class="of-container" [style.top.px]="topBuffer">
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
            .of-container {
                min-width: 100%;
            }
            .of-container,
            .of-bottom-space {
                position: absolute;
            }
            .of-bottom-space {
                width: 1px;
                height: 1px;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualTreeComponent implements OnDestroy, AfterViewInit {
    private disposers: (() => void)[] = [];
    private _model!: VirtualTree<any>;
    private renderArea = new VirtualRenderArea();

    @HostBinding('tabIndex')
    public tabIndex = 0;

    public visibleItems: any[] = [];

    @ContentChild(TemplateRef)
    public template!: TemplateRef<any>;

    @Input()
    public set model(value: VirtualTree<any>) {
        this._model = value;
        this.listenForDataChange(value);
    }
    public get model() {
        return this._model;
    }

    @Input()
    public set itemHeight(value: number) {
        this.renderArea.itemHeight = value;
    }

    public get topBuffer() {
        return this.renderArea.topBuffer;
    }

    public get totalHeight() {
        return this.renderArea.totalHeight;
    }

    constructor(private cdr: ChangeDetectorRef, private element: ElementRef<HTMLDivElement>) {}

    public ngAfterViewInit() {
        this.handleDataChange();
        this.invalidateSize();
        this.syncScrollPos();
    }
    public ngOnDestroy() {
        this.dispose();
    }

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

    @HostListener('scroll')
    public handleScrollChange() {
        if (this.element.nativeElement) {
            this.renderArea.scrollPos = this.element.nativeElement.scrollTop;
            this.updateVisibleItems();
        }
    }

    @HostListener('window:resize')
    public handleWindowResize() {
        this.invalidateSize();
    }

    public invalidateSize() {
        if (this.element.nativeElement) {
            const bounds = this.element.nativeElement.getBoundingClientRect();
            this.renderArea.viewerHeight = bounds.height;
            if (this.renderArea.itemCount !== this.visibleItems.length) {
                this.updateVisibleItems();
            }
        }
    }

    public scrollToSelected() {
        const selectedIndex = this.model.getSelectedIndex();
        if (typeof selectedIndex === 'number') {
            this.scrollToIndex(selectedIndex);
        }
    }

    public scrollTo(offset: number) {
        const { nativeElement } = this.element;
        if (nativeElement) {
            nativeElement.scrollTop = offset;
        }
    }

    public scrollToItem(item: any) {
        const selectedIndex = this.model.getItemIndex(item);
        if (typeof selectedIndex === 'number' && selectedIndex > -1) {
            this.scrollToIndex(selectedIndex);
        }
    }

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

    public getScrollPos() {
        return this.renderArea.scrollPos;
    }

    public syncScrollPos() {
        const { nativeElement } = this.element;
        if (nativeElement) {
            if (nativeElement.scrollTop !== this.renderArea.scrollPos) {
                nativeElement.scrollTop = this.renderArea.scrollPos;
                this.renderArea.scrollPos = nativeElement.scrollTop;
            }
        }
    }

    private listenForDataChange(model: VirtualTree<any>) {
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
