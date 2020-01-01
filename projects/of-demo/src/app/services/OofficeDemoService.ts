import { AppSettingsService } from './AppSettingsService';
import { Injectable } from '@angular/core';

type TreeDemoDataName = 'node_modules';

export interface ITreeItem {
    name: string;
    type: 'f' | 'd';
    children: ITreeItem[];
}

@Injectable()
export class OofficeDemoService {
    constructor(private appSettingsService: AppSettingsService) {}

    public getDemoTreeData(name: TreeDemoDataName) {
        return this.request<ITreeItem[]>('get', `Service?name=${name}`);
    }

    private async request<T>(method: 'get' | 'post', path: string, body?: any): Promise<T> {
        const response = await fetch(`${this.appSettingsService.get().apiRoot}api/${path}`, { method, body }),
            result = await response.json();

        return result as T;
    }
}
