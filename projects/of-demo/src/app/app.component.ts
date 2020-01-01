import { Component, OnInit } from '@angular/core';
import { AppSettingsService } from './services/AppSettingsService';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="ready"><app-landing></app-landing></ng-container>
    <ng-container *ngIf="!ready">loading</ng-container>`
})
export class AppComponent implements OnInit {
    public ready: boolean = false;

    constructor(private settingsService: AppSettingsService){}

    public ngOnInit(): void {
        this.start();
    }

    private async start() {
        await this.settingsService.init();

        this.ready = true;
    }
}
