import { Component, OnInit } from '@angular/core';
import { ITreeItem, OofficeDemoService } from '../../services/OofficeDemoService';
import { Node } from 'of-tree';

@Component({
  selector: 'app-show-off-tree',
  template: `
    <app-loading [show]="loading">Downloading Lots of Data</app-loading>
    <div class="page">
        <div class="text">
            <h1>🥦 of-basic-tree</h1>
            <p>On the right is a virtualized tree listing all the files under <strong>node_modules</strong> for a regular angular project. So many files, right?</p>
            <p>This is the <span class="snippet">of-tree</span>. You can get it for your angular project from NPM.</p>
            <p><a href="https://github.com/gjcampbell/ooffice/tree/master/projects/of-tree">Here's</a> the source code.</p>
            <p class="important">Mess around and try stuff like expand, search, arrow keys, etc.</p>
            <p class="important">Click an item and hold down the right arrow.</p>
        </div>
        <div class="tree">
            <div class="toolbar">
                <a (click)="tree.model.expandAll()"><i class="fas fa-plus-square" title="Expand All"></i></a>
                <a (click)="tree.model.collapseAll()"><i class="fas fa-minus-square" title="Collapse All"></i></a>
                <a (click)="tree.navigateToSelection()"><i class="fas fa-location-arrow" title="Scroll + Expand to Selection"></i></a>
                <input type="search" [(ngModel)]="filterText" />
            </div>
            <div class="tree-container">
                <of-basic-tree #tree [config]="config" [filterText]="filterText" [(selection)]="selected" [data]="treeData"></of-basic-tree>
            </div>
            <p>Selected Path: {{getPath(tree.model.getTreeNode(selected))}}</p>
            <p>Total Items: <strong>{{tree.model.query.count().toLocaleString()}}</strong></p>
            <a href="https://github.com/gjcampbell/ooffice/blob/master/projects/of-demo/src/app/components/pages/show-off-tree.component.ts">View example on github</a>
        </div>
    </div>`,
  styles: [
    `
    :host {
        display: block;
        margin: auto;
        margin-top: 5rem;
        max-width: 1200px;
    }
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
    .page {
        display: grid;
        grid-template-columns: 50% 50%;
    }
    .text {
        color: #228b22;
    }
    p {
        font-size: .875rem;
        color: #000c;
    }
    h1 {
        font-size: 4rem;
    }
    .important {
        font-size: 1.125rem;
        color: #228b22;
    }
    .tree-container {
        height: 400px;
        border: solid 1px #0003;
        display: block;
    }
    `
  ]
})
export class ShowOffTreeComponent implements OnInit {
    public loading: boolean = false;

    public treeData: ITreeItem[] = [];
    public selected: any;
    public filterText: string = '';
    public config = {
        filterThrottle: 1,
        filterTextMinLength: 0
    };

    constructor(private demoService: OofficeDemoService) {}


    public ngOnInit(): void {
        this.load();
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
