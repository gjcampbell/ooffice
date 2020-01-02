import { Component, OnInit } from '@angular/core';
import { ITreeItem, OofficeDemoService } from './services/OofficeDemoService';

@Component({
  selector: 'app-landing',
  template: `
    <app-loading [show]="loading">Downloading Lots of Data</app-loading>
    <div class="tree-container">
        <of-basic-tree [data]="treeData"></of-basic-tree>
    </div>`,
  styles: [
    `.tree-container {
        height: 400px;
        border: solid 1px #0003;
        display: block;
    }
    `
  ]
})
export class LandingComponent implements OnInit {
    public loading: boolean = false;

    public treeData: ITreeItem[] = [];

    constructor(private demoService: OofficeDemoService) {}

    public ngOnInit(): void {
        this.load();
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
