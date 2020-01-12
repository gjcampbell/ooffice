import { Component, OnInit } from '@angular/core';
import { ITreeItem, OofficeDemoService } from '../../services/OofficeDemoService';
import { Node } from 'of-tree';
import { DemoBaseComponent } from './demo-base.component';
import { AppSettingsService } from '../../services/AppSettingsService';

@Component({
    selector: 'app-show-off-tree',
    template: `
        <div class="tree">
            <div class="toolbar">
                <a (click)="tree.model.expandAll()"><i class="fas fa-plus-square" title="Expand All"></i></a>
                <a (click)="tree.model.collapseAll()"><i class="fas fa-minus-square" title="Collapse All"></i></a>
                <a (click)="tree.navigateToSelection()"><i class="fas fa-location-arrow" title="Scroll + Expand to Selection"></i></a>
                <input type="search" [(ngModel)]="filterText" />
            </div>
            <div class="tree-container">
                <app-loading [show]="loading">downloading a bunch of data</app-loading>
                <of-basic-tree #tree [config]="config" [filterText]="filterText" [(selection)]="selected" [data]="treeData"></of-basic-tree>
            </div>
            <p>Selected Path: {{ getPath(tree.model.getTreeNode(selected)) }}</p>
            <p>
                Total Items: <strong>{{ tree.model.query.count().toLocaleString() }}</strong>
            </p>
        </div>
    `,
    styles: [
        `
            .toolbar {
                display: flex;
            }
            .toolbar a {
                text-decoration: none;
                color: #000b;
                cursor: pointer;
                display: block;
                width: 1.5rem;
                height: 1.5rem;
                line-height: 1.5rem;
                text-align: center;
            }
            .toolbar a:hover {
                text-decoration: none;
                background-color: #228b2244;
            }
            .tree-container {
                height: 400px;
                border: solid 1px #0003;
                display: block;
            }
        `
    ]
})
export class ShowOffTreeComponent extends DemoBaseComponent {
    public loading: boolean = false;

    public treeData: ITreeItem[] = [];
    public selected: any;
    public filterText: string = '';
    public config = {
        filterThrottle: 1,
        filterTextMinLength: 0
    };

    constructor(private demoService: OofficeDemoService, settingService: AppSettingsService) {
        super(settingService);
    }

    protected async init() {
        await super.init();
        await this.load();
    }

    public getPath(node: Node<any>) {
        let result = '[Nothing]';

        if (node && node.item) {
            const path = [node.item.name];
            for (const parent of node.ancestors()) {
                if (parent.item && parent.item.name) {
                    path.unshift(parent.item.name);
                }
            }
            result = '/' + path.join('/');
        }

        return result;
    }

    private async load() {
        this.loading = true;
        try {
            const result = await this.demoService.getDemoTreeData('node_modules');
            this.treeData = result;
        } finally {
            this.loading = false;
        }
    }
}
