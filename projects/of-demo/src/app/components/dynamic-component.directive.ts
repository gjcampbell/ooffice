import { Directive, Input, ComponentFactoryResolver, Component, ViewContainerRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';

type Ctor = new (...args: any[]) => any;
type Inputs = { [key: string]: any };

@Directive({
    selector: '[componentType]'
})
export class DynamicComponentDirective implements OnInit, OnChanges {
    private componentInstance?: any;

    @Input('componentType')
    public type?: Ctor;

    @Input()
    public inputs?: Inputs;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef) {}

    public ngOnInit() {
        this.loadComponent();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if ('type' in changes) {
            this.loadComponent();
        } else if ('inputs' in changes) {
            this.updateInputs();
        }
    }

    private loadComponent() {
        const type = this.type;
        this.clearComponent();
        if (type) {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(type),
                component = this.viewContainerRef.createComponent(componentFactory);

            this.componentInstance = component;
            this.updateInputs();
        }
    }

    private clearComponent() {
        this.componentInstance = undefined;
        this.viewContainerRef.clear();
    }

    private updateInputs() {
        const component = this.componentInstance;
        if (this.inputs) {
            for (const key in this.inputs) {
                component[key] = this.inputs[key];
            }
        }
    }
}
