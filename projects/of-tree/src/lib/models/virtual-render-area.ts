/**
 * Simple calculator for a virtual render area
 */
export class VirtualRenderArea {
    private _scrollPos = 0;
    private _viewerHeight = 0;
    private _itemCount = 0;
    private _itemHeight = 0;
    private _visibleCount = 0;
    private _visibleStart = 0;
    private _topBuffer = 0;
    private _totalHeight = 0;

    public set itemHeight(value: number) {
        if (this._itemHeight !== value) {
            this._itemHeight = value;
            this.invalidateViewRange();
            this.invalidateTotalHeight();
            this.invalidateScrollPos();
        }
    }
    public get itemHeight() {
        return this._itemHeight;
    }

    public set itemCount(value: number) {
        if (this._itemCount !== value) {
            this._itemCount = value;
            this.invalidateViewRange();
            this.invalidateTotalHeight();
        }
    }
    public get itemCount() {
        return this._itemCount;
    }

    public set scrollPos(value: number) {
        if (this._scrollPos !== value) {
            this._scrollPos = value;
            this.invalidateViewRange();
        }
    }
    public get scrollPos() {
        return this._scrollPos;
    }

    public set viewerHeight(value: number) {
        if (this._viewerHeight !== value) {
            this._viewerHeight = value;
            this.invalidateViewRange();
            this.invalidateScrollPos();
        }
    }
    public get viewerHeight() {
        return this._viewerHeight;
    }

    public get visibleCount() {
        return this._visibleCount;
    }
    public get visibleStart() {
        return this._visibleStart;
    }
    public get topBuffer() {
        return this._topBuffer;
    }
    public get totalHeight() {
        return this._totalHeight;
    }

    private invalidateViewRange() {
        const maxItems = Math.ceil(this._viewerHeight / this._itemHeight) + 1;

        this._visibleStart = Math.floor(this._scrollPos / this._itemHeight);
        this._visibleCount = Math.min(this._itemCount - this._visibleStart, maxItems);
        this._topBuffer = this._visibleStart * this._itemHeight;
    }

    private invalidateTotalHeight() {
        this._totalHeight = this._itemHeight * this._itemCount;
    }

    private invalidateScrollPos() {
        this._scrollPos = Math.min(Math.max(0, this._totalHeight - this._viewerHeight), this._scrollPos);
    }
}
