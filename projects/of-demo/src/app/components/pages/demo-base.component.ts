import { OnInit } from '@angular/core';
import { AppSettingsService } from '../../services/AppSettingsService';

export class DemoBaseComponent implements OnInit {
    constructor(private settingsService: AppSettingsService) {}

    ngOnInit(): void {
        this.init();
    }

    protected async init() {
        await this.settingsService.init();
    }
}
