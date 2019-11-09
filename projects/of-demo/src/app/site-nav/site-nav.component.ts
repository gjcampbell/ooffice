import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
    selector: 'app-site-nav',
    template: `
        <a *ngFor="let item of links" matRipple [matTooltip]="item.name" [href]="'#' + item.link"
            ><i [attr.class]="'fa fa-' + item.icon"></i
        ></a>
    `,
    styles: [
        `
            :host {
                width: 60px;
            }
            a {
                color: white;
                display: block;
                line-height: 3rem;
                text-align: center;
            }
        `
    ]
})
export class SiteNavComponent {
    protected links = [
        {
            name: 'what',
            link: 'blah',
            icon: 'folder'
        },
        {
            name: 'dude',
            link: 'ok',
            icon: 'bath'
        }
    ];

    @HostBinding('attr.class')
    protected hostClass = 'mat-toolbar mat-primary';

    constructor() {}
}
