
import {
    hsml,
    Hsml,
    Hsmls,
    HsmlAttrs,
    HsmlFnc,
    HsmlObj,
    HsmlHandler
} from "./hsml";


class JsonmlDomHandler implements HsmlHandler {

    element: HTMLElement;

    private _current: HTMLElement;

    open(tag: string, attrs: HsmlAttrs, children: Hsmls, ctx?: any): boolean {
        const e = document.createElement(tag);
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let widget: any = attrs._widget;
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
                    case "_widget":
                        break;
                    case "id":
                        id = attrs[a] as string;
                        break;
                    case "classes":
                        classes = classes.concat(attrs[a]
                            ? attrs[a]
                                .map<string>(c => c.constructor === String
                                    ? c as string
                                    : (c[1] ? c[0] as string : undefined))
                                .filter(c => c)
                            : []);
                    break;
                    case "class":
                        classes = classes.concat((attrs[a] as string).split(" "));
                        break;
                    case "data":
                        for (const d in attrs[a]) {
                            if (attrs[a].hasOwnProperty(d)) {
                                if (attrs[a][d].constructor === String) {
                                    e.dataset[d] = attrs[a][d];
                                } else {
                                    e.dataset[d] = JSON.stringify(attrs[a][d]);
                                }
                            }
                        }
                        break;
                    case "styles":
                        for (const d in attrs[a]) {
                            if (attrs[a].hasOwnProperty(d)) {
                                (e.style as any)[d] = attrs[a][d];
                            }
                        }
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            e.addEventListener(a, attrs[a] as (e: Event) => void);
                        } else if (typeof attrs[a] === "boolean") {
                            attrs[a] && e.setAttribute(a, "");
                        } else {
                            e.setAttribute(a, attrs[a] as string);
                        }
                }
            }
        }
        if (id) {
            e.setAttribute("id", id);
        }
        if (classes.length) {
            e.classList.add(...classes);
        }
        if (this._current) {
            this._current.appendChild(e);
            this._current = e;
        } else {
            this.element = e;
            this._current = e;
        }
        if (widget && widget.mount && widget.mount.constructor === Function) {
            widget.mount(e);
        }
        return attrs._skip ? true : false;
    }

    close(tag: string, children: Hsmls, ctx?: any): void {
        if (this._current !== this.element) {
            this._current = this._current.parentElement;
        }
    }

    text(text: string, ctx?: any): void {
        this._current.appendChild(document.createTextNode(text));
    }

    fnc(fnc: HsmlFnc, ctx?: any): void {
        fnc(this._current);
    }

    obj(obj: HsmlObj, ctx?: any): void {
        if ("toHsml" in obj) {
            hsml(obj.toHsml(), this, obj);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

export function hsml2dom(hml: Hsml, ctx?: any): HTMLElement {
    const handler = new JsonmlDomHandler();
    hsml(hml, handler, ctx);
    return handler.element;
}

export function hsmls2dom(hmls: Hsmls, ctx?: any): Node[] {
    const elems: Node[] = [];
    for (const hml of hmls) {
        if (hml.constructor === String) {
            elems.push(document.createTextNode(hml as string));
        } else if ("toHsml" in (hml as any)) {
            const obj = hml as HsmlObj;
            elems.push(hsml2dom(obj.toHsml(), obj));
        } else {
            elems.push(hsml2dom(hml as Hsml, ctx));
        }
    }
    return elems;
}
