import { Component, OnInit, Input } from '@angular/core';
import { ITreeItem, OofficeDemoService } from '../../services/OofficeDemoService';
import { Node, OfVirtualTree } from 'of-tree';

@Component({
  selector: 'app-golden-tree',
  template: `
    <app-loading [show]="loading">Downloading Lots of Data</app-loading>
    <div class="page">
        <div class="text">
            <h1><span class="broccoli">🥦</span> <span class="stroke-text">templating</span></h1>
            <p>Just look at those old-school tree connector lines on that tree. Trees these days ain't like they used to be.</p>
            <p class="important">For total flexibility of appearance and behavior, use an <code>of-virtual-tree</code></p>
            <p>Minimal setup for a <code>&lt;of-virtual-tree [model]="model" [itemHeight]="25"&gt;&lt;/of-virtual-tree&gt;</code></p>
            <ol>
                <li><code>[itemHeight]</code> input should be the height of each item in the tree</li>
                <li><code>[model]</code> input should be an instance of an <code>OfVirtualTree(config)&lt;MyDataType&gt;</code></li>
                <li>Add an <code>&lt;ng-template let-node&gt;...&lt;/ng-template&gt;</code></li>
            </ol>
            <p>In the <code>OfVirtualTree</code> constructor, provide a config object with these members</p>
            <ol>
                <li><code>canExpand</code> a function accepting MyDataType, returning a bool indicating whether the item can be expanded, e.g., <code>(item: MyDataType) => item.isFolder ? true : false</code></li>
                <li><code>childAccessor</code> a function accepting MyDataType, returning undefined or an array or MyDataType, e.g., <code>(item: MyDataType) => item.subItems</code></li>
            </ol>
            <p>In the ng-template, add elements representing a single tree node, based on the <code>let-node</code> variable.</p>
            <p><code>node</code> has properties such as depth, parent, isLastChild, item (which is your original data), children, etc. </p>
            <p>Use the VtVirtualTree model to toggle or select nodes, or check their state.</p>
        </div>
        <div class="tree">
            <div class="header">
                <div class="col-1"><div>Package Name</div></div>
                <div class="col-2">No. of Children</div>
                <div class="col-3"></div>
            </div>
            <div class="tree-container">
                <of-virtual-tree [itemHeight]="25" [model]="treeModel">
                    <ng-template let-node>
                        <div class="tree-item" [class.highlight]="treeModel.isHighlighted(node.item)">
                            <div class="col-1" (click)="treeModel.selectAndHighlight(node.item)">
                                <app-golden-line (click)="treeModel.toggle(node.item)" [node]="node" [canExpand]="treeModel.isExpandable(node.item)" [expanded]="treeModel.isExpanded(node.item)"></app-golden-line>
                                <div class="icon" (click)="treeModel.toggle(node.item)"><i class="fa" [class.fa-box]="isPackage(node)" [class.fa-folder]="isFolder(node)" [class.fa-file]="isFile(node.item)"></i></div>
                                <div class="label">
                                    {{node.item.name}}
                                </div>
                            </div>
                            <div class="col-2">
                                {{node.item.children.length}}
                            </div>
                            <div class="col-3">
                                <a *ngIf="isPackage(node)" target="_blank" [attr.href]="'https://www.npmjs.com/package/' + node.item.name"><i class="fa fa-external-link-alt"></i></a>
                            </div>
                        </div>
                    </ng-template>
                </of-virtual-tree>
                <p>
                    <a href="https://github.com/gjcampbell/ooffice/blob/master/projects/of-demo/src/app/components/pages/golden-tree.component.ts">View example on github</a>
                </p>
            </div>
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
    .header,
    .tree-item {
        height: 25px;
        display: flex;
        align-items: center;
    }
    .header {
        font-weight: bold;
        width: calc(100% - 17px);
    }
    .tree-item:hover {
        background: #bb42;
    }
    .broccoli {
        filter: hue-rotate(281deg) brightness(1.5);
    }
    .page {
        display: grid;
        grid-template-columns: 50% 50%;
    }
    .col-1 {
        flex: 1 1 auto;
        width: 100%;
        overflow: hidden;
    }
    .header .col-1 {
        padding-left: 25px;
        box-sizing: border-box;
    }
    .tree-item .col-1 {
        cursor: pointer;
        display: flex;
        height: 100%;
        align-items: center;
    }
    .tree-item.highlight {
        background: #0bf4;
    }
    .col-2 {
        flex: 0 0 20%;
        line-height: 25px;
    }
    .header .col-2 {
        text-align: center;
    }
    .tree-item .col-2 {
        background: #0001;
        border: solid 0px #0002;
        border-width: 0 1px;
        text-align: right;
        box-sizing: border-box;
        padding-right: .5rem;
    }
    .col-3 {
        flex: 0 0 20%;
        text-align: center;
    }
    .tree-item .label {
        white-space: nowrap;
    }
    .text {
    }
    code {
        padding-inline-start: .5rem;
        padding-inline-end: .5rem;
        background: #0402;
        padding: 0.125rem 0;
    }
    p {
        font-size: .875rem;
        color: #000c;
    }
    li {
        line-height: 1.5rem;
    }
    h1 {
        font-size: 4rem;
    }
    .fa-folder {
        color: #e7c9a9;
    }
    .fa-file {
        color: #888;
    }
    .fa-box {
        color: #D60000b0;
    }
    h1 {
        color: #228b22;
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
export class GoldenTreeComponent implements OnInit {
    public loading: boolean = false;

    public treeModel: OfVirtualTree<ITreeItem> = new OfVirtualTree<ITreeItem>({
        canExpand: item => item.children && item.children.length > 0,
        childAccessor: item => item.children
    });

    constructor(private demoService: OofficeDemoService) {}

    public ngOnInit(): void {
        this.load();
    }

    public isPackage(node: Node<ITreeItem>) {
        return node.depth === 0 && node.item.name !== '.bin';
    }

    public isFolder(node: Node<ITreeItem>) {
        return (node.depth > 0 || node.item.name === '.bin') && node.item.type === 'd';
    }

    public isFile(item: ITreeItem) {
        return item.type === 'f';
    }

    private async load() {
        this.loading = true;
        try {
            const result = await this.demoService.getDemoTreeData('node_modules');
            this.treeModel.load(result);
        } finally {
            this.loading = false;
        }
    }
}

@Component({
    selector: 'app-golden-line',
    template: `
        <ng-container *ngFor="let item of getComponents()">
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <path [attr.d]="getPath(item)" />
            </svg>
        </ng-container>`,
    styles: [`
        :host {
            display: flex;
        }
        svg {
            width: 25px;
            height: 25px;
        }
        path {
            stroke: #000;
            fill: #0000;
            stroke-width: 4px;
        }
    `]
})
export class GoldenTreeLineComponent {
    private components: string[] = [];
    private _expanded = false;
    private _canExpand = false;
    private paths: {[key: string]: string} = {
        'n-e-ex': 'M 60, 0 V 30 M 90, 60 H 120 M 31, 31 h 58 v 58 h -58 v -59 M 60, 41 v 38 M 41, 60 h 38 Z',
        'n-e-nx': 'M 60, 0 V 30 M 90, 60 H 120 M 31, 31 h 58 v 58 h -58 v -59 M 41, 60 h 38 Z',
        'n-s-e-ex': 'M 60, 0 V 30 M 90, 60 H 120 M 31, 31 h 58 v 58 h -58 v -59 M 60, 41 v 38 M 41, 60 h 38 M 60, 90 V 120 Z',
        'n-s-e-nx': 'M 60, 0 V 30 M 90, 60 H 120 M 31, 31 h 58 v 58 h -58 v -59 M 41, 60 h 38 M 60, 90 V 120 Z',
        'n-s': 'M 60, 0 V 120 Z',
        'n-e': 'M 60, 0 V 60 M 60, 60 H 120 Z',
        'n-s-e': 'M 60,0 V 120 M 60, 60 H 120 Z'
    }

    @Input()
    public node!: Node<any>;

    @Input()
    public set canExpand(value: boolean) {
        this._canExpand = value;
        this.components = undefined;
    }

    @Input()
    public set expanded(value: boolean) {
        this._expanded = value;
        this.components = undefined;
    }

    public getComponents() {
        if (!this.components) {
            this.components = [...this.getParents(), this.getTerminal()];
        }

        return this.components;
    }

    public getPath(item: string) {
        return this.paths[item];
    }

    private getParents() {
        const result = [],
            nonRootParents = [...this.node.ancestors()].reverse().slice(1);

        for (const parent of nonRootParents) {
            result.push(parent.isLastChild ? '' : 'n-s')
        }

        return result;
    }

    private getTerminal() {
        let result = this.node.isLastChild ? 'n-e' : 'n-s-e';
        if (this._canExpand) {
            result += this._expanded ? '-nx' : '-ex';
        }
        return result;
    }
}

