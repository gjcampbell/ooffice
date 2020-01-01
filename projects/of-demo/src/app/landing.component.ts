import { Component, OnInit } from '@angular/core';
import { ITreeItem, OofficeDemoService } from './services/OofficeDemoService';

@Component({
  selector: 'app-landing',
  template: `<of-basic-tree [data]="treeData"></of-basic-tree>`,
  styles: [
    `:host {
        height: 400px;
        border: solid 1px #0003;
        display: block;
    }`
  ]
})
export class LandingComponent implements OnInit {
    public title = 'of-demo';

    public treeData: ITreeItem[] = [];

    constructor(private demoService: OofficeDemoService) {}

    public ngOnInit(): void {
        this.load();
    }

    private async load() {
        const result = await this.demoService.getDemoTreeData('node_modules');
        this.treeData = result;
    }
}
