type AnyConstructor = new (...args: any[]) => any;

export interface EndpointDescriptor {
    name: string;
    icon: string;
    link: string;
}

export interface EndpointItem {
    name: string;
    icon: string;
    link: string;
    type: AnyConstructor;
}

export class Endpoints {
    private items: EndpointItem[] = [];
    private _byLink?: Map<string, EndpointItem>;
    private _byType?: Map<AnyConstructor, EndpointItem>;

    private static instance?: Endpoints;
    public static get() {
        return Endpoints.instance || (Endpoints.instance = new Endpoints());
    }

    private constructor() {}

    public getByType(ctor: AnyConstructor) {
        if (!this._byType) {
            this._byType = new Map<AnyConstructor, EndpointItem>();
            this.items.forEach(d => this._byType.set(d.type, d));
        }
        return this._byType.get(ctor);
    }

    public getByLink(link: string) {
        if (!this._byLink) {
            this._byLink = new Map<string, EndpointItem>();
            this.items.forEach(d => this._byLink.set(d.link.toLocaleLowerCase(), d));
        }
        return this._byLink.get(link.toLocaleLowerCase());
    }

    public add(...descriptor: EndpointItem[]) {
        this.items.push(...descriptor);
        this.refreshLookups();
    }

    public getAll() {
        return [...this.items];
    }

    private refreshLookups() {
        this._byLink = this._byType = undefined;
    }
}

export function Endpoint(descriptor: EndpointDescriptor) {
    return function(ctor: AnyConstructor) {
        Endpoints.get().add({ ...descriptor, type: ctor });
    };
}
