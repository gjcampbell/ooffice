import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-shell',
    template: `
        <app-site-nav></app-site-nav>
    `,
    styles: [
        `
            :host {
                display: flex;
                height: 100%;
                align-items: stretch;
            }
        `
    ]
})
export class ShellComponent {
    constructor() {}
}
