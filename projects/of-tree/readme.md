# Ooffice Virtual Tree 🥦

This is a virtual tree for angular 2+. It has excellent performance for 10s of thousands of items, supports search, expand/collapse all, templating, drag and drop, lazy load, keyboard navigation.

## Install

`npm i of-tree` obviously

## Features
- **Configurability** - *Easy out-of-the-box settings can be easily overridden to support exotic scenarios*
- **Keyboard Navigation** - *Supports standard arrow-key tree behavior*
- **Search** - *Immediate or throttled, text or faceted search of a huge number of nodes*
- **Expand/Collapse All** - *Expand all instantly even on 10s of thousands of nodes*
- **Templatible** - *Have complete control over the appearance and behavior*
- **Schemaless** - *Bind to data with a few known properties OR bind to any data whatsoever via simple configuration*
- **Lazy load** - *Easily minimize data requests by loading child nodes on demand, by depth and ancestry*
- **Drag and Drop** - *Reparent nodes by dragging*
- **Navigate To** - *Expand and scroll immediately to any item in the tree, any depth*

## Quick Setup

1. Import the module
```typescript
import { OfVirtualTreeModule } from 'of-tree';

@NgModule({
  imports: [..., OfVirtualTreeModule],
  ...
})
export class AppModule { }
```


2. Use the `of-basic-tree` component
```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <div class="container">
            <of-basic-tree [(selection)]="selectedItem" [data]="treeData"></of-basic-tree>
        </div>`,
    styles: [`
        .container { height: 400px; }
    `]
})
export class MyComponent {
    public selectedItem?: IMyDataType;
    public treeData: IMyDataType[] = [];
}

interface IMyDataType {
    name: string;
    children: IMyDataType[];
    type: 'Folder' | 'File';
}
```

For the most minimal setup expects, provide data with known properties, and put the tree inside a container of a non-zero height. However, the tree is very configurable. It has a robust public API and allows detailed configuration.

## More Info

- [Demo Site](https://oofficestorage.z19.web.core.windows.net/)
- [Documentation Site](https://oofficestorage.z19.web.core.windows.net/)

## Browser Support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | Other Browsers |
| --------- | --------- |
| Latest version | Unknown. Don't Care. |

This virtual tree is intended for business applications where the on-call support can fix most problems by asking "did you try it in chrome?" Developing for one browser is very cost effective.

## Other Options

Here are some other virtual tree implementations for angular.
- `angular-tree-component` [Demo](https://angular2-tree.readme.io/docs/large-trees) [Source](https://github.com/500tech/angular-tree-component)
- ...I'm sure there are others out there, just can't find them atm

## Contribute

If you find a bug, the best thing is to fix it, and submit a pull request. The second best thing is to open an issue and provide a lot of details and rage emojis and venting. The worst best thing is to not do anything. Any contribution is appreciated :)

Run `npm run ng serve of-demo`

Open [localhost:4200](http://localhost:4200) in chrome
