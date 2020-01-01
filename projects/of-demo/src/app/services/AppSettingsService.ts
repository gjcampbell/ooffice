import { Injectable } from "@angular/core";

interface IAppSettings {
    apiRoot: string;
}

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
    private appSettings?: IAppSettings;

    public get() {
        return this.appSettings;
    }

    public async init() {
        const response = await fetch('/assets/appsettings.json', { method: 'get' }),
            result = await response.json();

        this.appSettings = result as IAppSettings;
    }
}
