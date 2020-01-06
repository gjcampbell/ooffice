# Virtual Tree Guide

{{ng.show-off-tree}}

The tree above is a virtualized tree listing all the files under `node_modules` for a regular angular project. So many files, right?

This is the of-tree. You can get it for your angular project [from NPM](https://www.npmjs.com/package/of-tree). [Here's the source code.](https://github.com/gjcampbell/ooffice/tree/master/projects/of-tree)

Mess around and try stuff like expand-all, search, arrow keys, etc. Click an item and hold down the right arrow.

## Templating

{{ng.golden-tree}}

Just look at those old-school tree connector lines on that tree. Trees these days ain't like they used to be.

For total flexibility of appearance and behavior, use an `of-virtual-tree`

Minimal setup for an of-virtual-tree

```html
<of-virtual-tree [model]="model" [itemHeight]="25">
    <ng-template let-node>
        <div [style.paddingLeft.px]="node.depth * 15">{{node.item.name}}<div>
    </ng-template>
</of-virtual-tree>
```

1. `[itemHeight]` input should be the height of each item in the tree
2. `[model]` input should be an instance of an `OfVirtualTree(config)<MyDataType>`. In the `config`, provide an object with these members
    1. `canExpand` a function accepting MyDataType, returning a bool indicating whether the item can be expanded, e.g., `(item: MyDataType) => item.isFolder ? true : false`
    2. `childAccessor` a function accepting MyDataType, returning undefined or an array or MyDataType, e.g., `(item: MyDataType) => item.subItems`
3. Add an `<ng-template let-node></ng-template>`. In the ng-template, add elements representing a single tree node, using the tree model and the `let-node` variable. `node` has properties such as `depth`, `parent`, `isLastChild`, `item` (which is your original data), children, etc.
