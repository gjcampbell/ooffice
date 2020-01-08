import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { Application, ProjectReflection, ReflectionKind, DeclarationReflection } from 'typedoc';
import { ReflectionType, Type, InferredType, IntrinsicType, Comment } from 'typedoc/dist/lib/models';
import { TypeSerializer } from 'typedoc/dist/lib/serialization';
import { SourceReference } from 'typedoc/dist/lib/models/sources/file';

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
            (cls: DeclarationReflection) => `

# class \`${cls.name}\`

${this.createProperties(cls.name, cls.getChildrenByKind(ReflectionKind.Property | ReflectionKind.Accessor))}
${this.createMethods(cls.name, cls.getChildrenByKind(ReflectionKind.Method))}
        `
        );
    }

    private createProperties(clsName: string, properties: DeclarationReflection[]) {
        return this.section(
            clsName +
                ` Properties
| Name | Type | Readonly | Notes |
|---|---|:---:|---|`,
            this.join(
                properties.filter(p => p.flags.isPublic),
                p => {
                    return p.kind === ReflectionKind.Accessor
                        ? this.createGetter(p)
                        : p.kind === ReflectionKind.Property
                        ? this.createProperty(p)
                        : '';
                }
            )
        );
    }

    private createGetter(p: DeclarationReflection) {
        const getter = p.getSignature,
            isreadonly = !p.setSignature ? '🔒' : '';
        return !getter
            ? ''
            : `| ${p.name} | ${getter.type.toString().replace(/\|/g, '\\|')} | ${isreadonly} | ${this.createComment(p.comment)} ${this.link(
                  p.sources
              )} |`;
    }

    private createProperty(p: DeclarationReflection) {
        return `| ${p.name} | ${p.type.toString().replace(/\|/g, '\\|')} |  | ${this.link(p.sources)} ${this.createComment(p.comment)}|`;
    }

    private createMethods(clsName: string, methods: DeclarationReflection[]) {
        return this.section(
            clsName +
                ` Methods
| Name | Signature | Notes |
|---|---|---|`,
            this.join(
                [].concat(...methods.filter(m => m.flags.isPublic).map(m => ({ method: m, sig: m.signatures[0] }))),
                m =>
                    `| ${m.sig.name} | ${m.sig.toString().replace(/\|/g, '\\|')} | ${this.createComment(m.sig.comment)} ${this.link(
                        m.method.sources
                    )} |`
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

    private link(sources: SourceReference[]) {
        const source = sources && sources.length ? sources[0] : null,
            path = source ? source.fileName : null,
            line = source ? `#L${source.line}` : '';

        return !path
            ? ''
            : `[📃](https://github.com/gjcampbell/ooffice/blob/master/projects/${this.projectName}/src/${path}${line} "go to source")`;
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
