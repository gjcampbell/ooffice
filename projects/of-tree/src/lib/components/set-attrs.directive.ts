import { Directive, ElementRef, Input } from '@angular/core';

type Attributes = { [attr: string]: any } | undefined;

@Directive({
    selector: '[ofSetAttrs]'
})
export class SetAttrsDirective {
    private _attrs: Attributes = undefined;

    @Input('ofSetAttrs')
    public set attrs(value: Attributes) {
        this._attrs = value;
        this.applyAttributes();
    }

    constructor(private el: ElementRef) {
        this.applyAttributes();
    }

    private applyAttributes() {
        const attrs = this._attrs,
            el = this.el.nativeElement;

        if (attrs && el) {
            for (const name of Object.keys(attrs)) {
                el.setAttribute(name, attrs[name]);
            }
        }
    }
}
