import {
    hsml,
    Hsml,
    Hsmls,
    HsmlHead,
    HsmlAttrs,
    HsmlFnc,
    HsmlObj,
    HsmlHandler,
    HsmlHandlerCtx,
    HsmlAttrOnData
} from "./hsml";

class HsmlDomHandler implements HsmlHandler<HsmlHandlerCtx> {

    element: HTMLElement;

    private _current: HTMLElement;

    open(tag: HsmlHead, attrs: HsmlAttrs, children: Hsmls, ctx?: HsmlHandlerCtx): boolean {
        const e = document.createElement(tag);
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let ref: string = attrs._ref;
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
                                    e.dataset[d] = attrs[a][d] as string;
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
                    case "on":
                        if (typeof attrs[a][1] === "function") {
                            e.addEventListener(attrs[a][0] as string, attrs[a][1] as (e: Event) => void);
                        } else if (typeof attrs[a][1] === "string") {
                            e.addEventListener(attrs[a][0] as string, (e: Event) => {
                                ctx && ctx.onHsml &&
                                typeof ctx.onHsml === "function" &&
                                ctx.onHsml(attrs[a][1] as string,
                                           attrs[a][2] as HsmlAttrOnData,
                                           e);
                            });
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
        if (ctx && ref) {
            ctx.refs[ref] = this._current;
        }
        if (widget && widget.mount && widget.mount.constructor === Function) {
            widget.mount(e);
        }
        return attrs._skip ? true : false;
    }

    close(tag: HsmlHead, children: Hsmls, ctx?: HsmlHandlerCtx): void {
        if (this._current !== this.element) {
            this._current = this._current.parentElement;
        }
    }

    text(text: string, ctx?: HsmlHandlerCtx): void {
        this._current.appendChild(document.createTextNode(text));
    }

    fnc(fnc: HsmlFnc, ctx?: HsmlHandlerCtx): void {
        fnc(this._current);
    }

    obj(obj: HsmlObj, ctx?: HsmlHandlerCtx): void {
        if ("toHsml" in obj) {
            hsml(obj.toHsml(), this, obj as HsmlHandlerCtx);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

export function hsml2dom(hml: Hsml, ctx?: HsmlHandlerCtx): HTMLElement {
    const handler = new HsmlDomHandler();
    hsml(hml, handler, ctx);
    return handler.element;
}

export function hsmls2dom(hmls: Hsmls, ctx?: HsmlHandlerCtx): Node[] {
    const elems: Node[] = [];
    for (const hml of hmls) {
        if (hml.constructor === String) {
            elems.push(document.createTextNode(hml as string));
        } else if ("toHsml" in (hml as any)) {
            const obj = hml as HsmlHandlerCtx;
            elems.push(hsml2dom(obj.toHsml(), obj));
        } else {
            elems.push(hsml2dom(hml as Hsml, ctx));
        }
    }
    return elems;
}
