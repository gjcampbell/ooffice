import { Component, OnInit } from '@angular/core';
import { Endpoint } from '../../site-nav/site-nav';
import { BasicTreeConfig } from 'projects/of-tree/src';

interface Item {
    name: string;
    children?: Item[];
}

@Endpoint({ name: 'Tree Demo', icon: 'folder', link: 'tree' })
@Component({
    template: `
        <app-demo-section>
            <app-banner text="of-tree"></app-banner>
            <div class="content">
                <div class="tree-container">
                    <of-basic-tree [itemHeight]="24" [data]="data" [config]="config"></of-basic-tree>
                </div>
                <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="dataJson"></ngx-monaco-editor>
            </div>
        </app-demo-section>
    `,
    styles: [
        `
            ngx-monaco-editor {
                height: 100%;
            }
            .content {
                height: 300px;
                display: grid;
                grid-template-columns: 50% 50%;
            }
            .tree-container {
                height: 100%;
            }
        `
    ]
})
export class TreeDemoComponent implements OnInit {
    protected config = {
        getName: item => item.name,
        childAccessor: item => item.children
    } as Partial<BasicTreeConfig<Item>>;

    private _data: Item[] = [];
    private _dataJson: string = '';

    protected get data() {
        return this._data;
    }
    protected set data(value: Item[]) {
        this._dataJson = JSON.stringify(value, undefined, 4);
        this._data = value;
    }
    protected get dataJson() {
        return this._dataJson;
    }
    protected set dataJson(value: string) {
        this._dataJson = value;
        try {
            this._data = JSON.parse(value);
        } catch {}
    }
    protected editorOptions = {
        language: 'json'
    };

    constructor() {}

    public ngOnInit(): void {
        this.data = [
            {
                name: 'what',
                children: [{ name: 'dude' }, { name: 'ok' }]
            }
        ];
    }
}
