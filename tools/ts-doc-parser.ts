import * as ts from 'typescript';
import { readFileSync } from 'fs';
import { resolve } from 'path';
const root = resolve(__dirname, './..');

class TsFileReader {
    private root: ts.SourceFile;

    private constructor(private filepath: string) {
        this.root = ts.createSourceFile(filepath, readFileSync(filepath).toString(), ts.ScriptTarget.ES2015);
    }

    public static read(filepath: string) {
        const reader = new TsFileReader(filepath);
        reader.readFile();
    }

    /**
     * Read exported classes, interfaces, types, and enums only
     */
    private readFile() {
        this.root.forEachChild(n => {
            switch (n.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    this.readClass(n as ts.ClassDeclaration);
                    break;
                case ts.SyntaxKind.InterfaceDeclaration:
                    this.readInterface(n as ts.InterfaceDeclaration);
                    break;
                case ts.SyntaxKind.TypeAliasDeclaration:
                    this.readTypeAlias(n as ts.TypeAliasDeclaration);
                    break;
                case ts.SyntaxKind.EnumDeclaration:
                    this.readEnum(n as ts.EnumDeclaration);
                    break;
            }
        });
    }
    private readClass(cls: ts.ClassDeclaration) {
        if (this.isExported(cls)) {
            console.log('found exported class ' + cls.name.text);
            this.readPublicMembers(cls);
        }
    }
    private readInterface(ifc: ts.InterfaceDeclaration) {
        if (this.isExported(ifc)) {
            console.log('found exported class ' + ifc.name);
        }
    }
    private readTypeAlias(type: ts.TypeAliasDeclaration) {
        if (this.isExported(type)) {
            console.log('found exported class ' + type.name);
        }
    }
    private readEnum(enm: ts.EnumDeclaration) {
        if (this.isExported(enm)) {
            console.log('found exported class ' + enm.name);
        }
    }

    private readClassMembers(cls: ts.ClassDeclaration) {
        for (const item of cls.members) {
        }
    }

    private readJsDoc(item: ts.Symbol) {
        item.getDocumentationComment();
    }

    private isExported(item: { modifiers?: ts.ModifiersArray }) {
        return !!item.modifiers && item.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    }

    private readExports() {}
}

TsFileReader.read(resolve(root, './projects/of-tree/src/lib/models/node.ts'));
console.log(ts.SyntaxKind.ExportKeyword);
