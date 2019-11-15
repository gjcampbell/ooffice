import { Component, OnInit, HostBinding } from '@angular/core';
import { EndpointItem, Endpoints } from './site-nav';

@Component({
    selector: 'app-site-nav',
    template: `
        <a *ngFor="let item of links" matRipple matTooltipPosition="right" [matTooltip]="item.name" [href]="'#' + item.link"
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
export class SiteNavComponent implements OnInit {
    protected links: EndpointItem[];

    @HostBinding('attr.class')
    protected hostClass = 'mat-toolbar mat-primary';

    constructor() {}

    public ngOnInit() {
        this.links = Endpoints.get().getAll();
    }
}
