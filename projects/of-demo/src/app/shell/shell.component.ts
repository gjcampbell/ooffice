import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-shell',
    template: `
        <app-site-nav></app-site-nav>
        <app-site-content></app-site-content>
    `,
    styles: [
        `
            :host {
                display: grid;
                height: 100%;
                grid-template-columns: 60px auto;
            }
        `
    ]
})
export class ShellComponent {
    constructor() {}
}
