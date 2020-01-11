import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { Application, ProjectReflection, ReflectionKind, DeclarationReflection } from 'typedoc';
import { ReflectionType, Type, InferredType, IntrinsicType, Comment, Decorator } from 'typedoc/dist/lib/models';
import { TypeSerializer } from 'typedoc/dist/lib/serialization';
import { SourceReference } from 'typedoc/dist/lib/models/sources/file';

function mdcode(type: string, code: string) {
    return `\`\`\`${type}
${code}
\`\`\``;
}

function mdtrow(items: string[]) {
    const values = items.map(v => v.replace(/\n/g, '<br />').replace(/\|/g, '\\|')),
        result = values.length ? `| ${values.join(' | ')} |` : '';

    return result;
}

function mdtable(header: string[], alignment: string[] | undefined, items: string[][]) {
    const headerText = mdtrow(header),
        headerUnderline = mdtrow(alignment || header.map(v => '---')),
        text = items.map(v => mdtrow(v));

    return [headerText, headerUnderline, ...text].filter(v => !!v).join('\r\n');
}

interface IMdFile {
    md: string;
    componentName: string;
}

class ApiDocFileSystem {
    private fileMatcher = new RegExp(/apidocs-(?<name>.*)\.json/);

    constructor(private docJsonLocation: string, private dropLocation: string) {}

    public saveMdFile(file: IMdFile) {
        writeFileSync(resolve(this.dropLocation, `./${file.componentName}.gendoc.md`), file.md, { encoding: 'utf8' });
    }
}

class MdGenerator {
    constructor(private project: ProjectReflection, private projectName: string) {}

    public createMd(): IMdFile {
        return {
            md: `
${this.createClasses()}
        `,
            componentName: this.projectName
        };
    }

    private createClasses() {
        return this.join(
            this.project.getReflectionsByKind(ReflectionKind.Class).filter(cls => cls.flags.isExported),
            (cls: DeclarationReflection) => {
                return cls.decorators && cls.decorators.find(d => d.name === 'Component')
                    ? this.createComponent(<any>cls)
                    : this.createClass(<any>cls);
            }
        );
    }

    private createProperties(clsName: string, properties: DeclarationReflection[]) {
        return this.section(
            clsName + ' Properties',
            mdtable(
                ['Name', 'Type', 'Readonly', 'Notes'],
                ['---', '---', ':---:', '---'],
                properties
                    .filter(p => p.flags.isPublic)
                    .map(p =>
                        p.kind === ReflectionKind.Accessor
                            ? this.createGetter(p)
                            : p.kind === ReflectionKind.Property
                            ? this.createProperty(p)
                            : []
                    )
            )
        );
    }

    private createComponent(cls: DeclarationReflection & { kind: ReflectionKind.ClassOrInterface }) {
        const selector = cls.name
                .replace(/([A-Z])/g, l => `-${l.toLowerCase()}`)
                .replace('-component', '')
                .substring(1),
            ml = !selector ? '' : mdcode('html', `<${selector} ${this.createBindings(cls)}></${selector}>`);

        return `

# component \`${cls.name}\`

${ml}

${this.createProperties(cls.name, cls.getChildrenByKind(ReflectionKind.Property | ReflectionKind.Accessor))}
${this.createMethods(cls.name, cls.getChildrenByKind(ReflectionKind.Method))}
        `;
    }

    private createClass(cls: DeclarationReflection & { kind: ReflectionKind.ClassOrInterface }) {
        return `

# class \`${cls.name}\`

${this.createProperties(cls.name, cls.getChildrenByKind(ReflectionKind.Property | ReflectionKind.Accessor))}
${this.createMethods(cls.name, cls.getChildrenByKind(ReflectionKind.Method))}
        `;
    }

    private createGetter(p: DeclarationReflection) {
        const getter = p.getSignature,
            isreadonly = !p.setSignature ? 'Y' : 'N';
        return !getter ? [] : [this.link(p.sources, p.name), getter.type.toString(), isreadonly, this.createComment(p.comment)];
    }

    private createBindings(cls: DeclarationReflection) {
        const bindings = this.getBindings(cls);
        return bindings.join(' ');
    }

    private getBindings(cls: DeclarationReflection) {
        const result: string[] = [];

        for (const item of cls.children) {
            if (item.decorators) {
                const input = item.decorators.find(d => d.name === 'Input'),
                    output = item.decorators.find(d => d.name === 'Output'),
                    decorator = input || output;

                if (decorator) {
                    const name =
                            decorator.arguments && decorator.arguments.bindingPropertyName
                                ? decorator.arguments.bindingPropertyName
                                : item.name,
                        format = input ? `[${name}]` : `(${name})`;
                    result.push(format);
                }
            }
        }

        return result;
    }

    private createProperty(p: DeclarationReflection) {
        return [this.link(p.sources, p.name), p.type.toString(), '', this.createComment(p.comment)];
    }

    private createMethods(clsName: string, methods: DeclarationReflection[]) {
        return this.section(
            clsName + ' Methods',
            mdtable(
                ['Name', 'Signature', 'Notes'],
                undefined,
                methods
                    .filter(m => m.flags.isPublic)
                    .map(m => ({ method: m, sig: m.signatures[0] }))
                    .map(m => [this.link(m.sig.sources, m.sig.name), m.sig.toStringHierarchy(), this.createComment(m.sig.comment)])
            )
        );
    }

    private createComment(comment: Comment) {
        const text = !comment ? '' : comment.shortText ? comment.shortText : comment.text ? comment.text : '';
        return text.replace(/\n/g, '<br />');
    }

    private section(header: string, content: string) {
        return !content
            ? ''
            : `
## ${header}
${content}
        `;
    }
    private join<T>(items: T[], generator: (item: T) => string, separator: string = '\r\n') {
        const results = items.map(o => generator(o));

        return results.join(separator);
    }

    private createType(item: { type: Type }) {
        //return item.type.
    }

    private getId(cls: DeclarationReflection & { kind: ReflectionKind.ClassOrInterface }) {
        return cls.name.toLocaleLowerCase();
    }

    private link(sources: SourceReference[], text?: string) {
        const source = sources && sources.length ? sources[0] : null,
            path = source ? source.fileName : null,
            linkText = text || '📃',
            line = source ? `#L${source.line}` : '';

        return !path
            ? ''
            : `[${linkText}](https://github.com/gjcampbell/ooffice/blob/master/projects/${this.projectName}/src/${path}${line} "go to source")`;
    }
}

(function() {
    const app = new Application({
            tsconfig: 'projects/of-tree/tsconfig.lib.json'
        }),
        files = app.expandInputFiles(['projects/of-tree/src']).filter(f => !(f.endsWith('test.ts') || f.endsWith('spec.ts'))),
        conversion = app.convert(files),
        root = resolve(__dirname, './..'),
        dropLocation = resolve(root, './projects/of-demo/src/assets/'),
        docJsonLocation = resolve(root, './dist/'),
        fileSystem = new ApiDocFileSystem(docJsonLocation, dropLocation),
        mdGen = conversion ? new MdGenerator(conversion, 'of-tree') : null;

    if (mdGen) {
        fileSystem.saveMdFile(mdGen.createMd());
    }
})();
