import { Component, Input, HostBinding } from '@angular/core';

@Component({
    selector: 'app-banner',
    template: `
        <h1>{{ text }}</h1>
        <ng-content></ng-content>
    `,
    styles: [
        `
            :host {
                background: #0001;
                color: #0004;
            }
            h1 {
                font-size: 2rem;
            }
        `
    ]
})
export class BannerComponent {
    @Input()
    public text: string;

    @HostBinding('attr.class')
    protected hostClass = 'mat-accent';
}

@Component({
    selector: 'app-demo-section',
    template: `
        <ng-content></ng-content>
    `,
    styles: [
        `
            :host {
                display: grid;
                grid-template-columns: 100px auto;
            }
        `
    ]
})
export class DemoSectionComponent {}
