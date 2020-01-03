# Ooffice Virtual Tree 🥦

This is a virtual tree for angular 2+. It has excellent performance for 10s of thousands of items, supports search, expand/collapse all, templating, drag and drop, lazy load, keyboard navigation.

## Features
- **Configurability** - *Easy out-of-the-box settings can be easily overridden to support exotic scenarios*
- **No Dependencies** - *This is built on Angular alone, no other libraries needed*
- **Keyboard Navigation** - *Supports standard arrow-key tree behavior*
- **Search** - *Immediate or throttled, text or faceted search of a huge number of nodes*
- **Expand/Collapse All** - *Expand all instantly even on 10s of thousands of nodes*
- **Templatible** - *Have complete control over the appearance and behavior*
- **Schemaless** - *Bind to data with a few known properties OR bind to any data whatsoever via simple configuration*
- **Lazy load** - *Easily minimize data requests by loading child nodes on demand, by depth and ancestry*
- **Drag and Drop** - *Reparent nodes by dragging*
- **Navigate To** - *Expand and scroll immediately to any item in the tree, any depth*

## More Info

- [Demo Site](https://oofficestorage.z19.web.core.windows.net/)
- [Documentation Site](https://oofficestorage.z19.web.core.windows.net/)

## How does it work?

This tree component supports a huge number of nodes with minimal performance impact to the app hosting it. It does this by virtualizing the view of nodes, so that only the nodes visible in a scrollable container are rendered. However, virtualizing a hierarchical data structure is complicated. If the DOM structure were rendered hierarchically like the data, then it could not be virtualized. So, the data must be flattened before it is virtualized. Now, if the data is just flattened, then we the information about the depth and relationships of the hierarchical data is lost. So, before flattening the data, the metadata describing the relationships of the data must be stored.

To summarize, this tree is built around this recipe (which works for any hierarchical data view):
1. Store hierarchy metadata
1. Flatten the data
1. Virtualize, render only visible items

## Install

`npm i of-tree` obviously

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

## Browser Support

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome |
| --------- | --------- | --------- |
| Edge| last version| last version|

This virtual tree is intended for business applications where the on-call support can fix most problems by asking "did you try it in chrome?" Developing for one browser is very cost effective.

## Other Options

Here are some other virtual tree implementations for angular.
- `angular-tree-component` [Demo](https://angular2-tree.readme.io/docs/large-trees) [Source](https://github.com/500tech/angular-tree-component)
- ...I'm sure there are others out there, just can't find them atm

## Contribute

If you find a bug, the best thing is to fix it, and submit a pull request. The second best thing is to open an issue and provide a lot of details and rage emojis and venting. The worst best thing is to not do anything. Any contribution is appreciated :)

Run `npm run ng serve of-demo`

Open [localhost:4200](http://localhost:4200) in chrome
