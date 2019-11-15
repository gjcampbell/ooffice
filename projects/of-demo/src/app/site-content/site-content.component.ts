import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Endpoints } from '../site-nav/site-nav';

@Component({
    selector: 'app-site-content',
    template: `
        <div [componentType]="type"></div>
    `,
    styles: [
        `
            :host {
                height: 100%;
            }
        `
    ]
})
export class SiteContentComponent implements OnInit, OnDestroy {
    protected type?: any;

    constructor() {}

    public ngOnInit(): void {
        this.loadCurrentHash();

        window.addEventListener('hashchange', this.handleHashChange);
    }

    public ngOnDestroy() {
        window.removeEventListener('hashchange', this.handleHashChange);
    }

    private handleHashChange = (evt: HashChangeEvent) => {
        const { newURL, oldURL } = evt;
        console.log(oldURL, newURL);
        this.loadCurrentHash();
    };

    private loadCurrentHash() {
        const hash = window.location.hash;
        this.load(hash.replace(/^#/, ''));
    }

    private load(link: string) {
        const endpoint = Endpoints.get().getByLink(link);

        this.type = endpoint ? endpoint.type : undefined;
    }
}
