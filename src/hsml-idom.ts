import {
    hsml,
    Hsml,
    Hsmls,
    HsmlAttrs,
    HsmlFnc,
    HsmlObj,
    HsmlHandler
} from "./hsml";
import * as idom from "incremental-dom";

class JsonmlIDomHandler implements HsmlHandler {

    open(tag: string, attrs: HsmlAttrs, children: Hsmls, ctx?: any): boolean {
        const props: any[] = [];
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
                                    props.push("data-" + d, attrs[a][d]);
                                } else {
                                    props.push("data-" + d, JSON.stringify(attrs[a][d]));
                                }
                            }
                        }
                        break;
                    case "styles":
                        props.push("style", attrs[a]);
                        break;
                    case "on":
                        if (typeof attrs[a][1] === "function") {
                            props.push("on" + attrs[a][0], attrs[a][1]);
                        } else if (typeof attrs[a][1] === "string") {
                            props.push("on" + attrs[a][0], (e: Event) => {
                                ctx && ctx._on &&
                                typeof ctx._on === "function" &&
                                ctx._on(attrs[a][1], attrs[a][2], e);
                            });
                        }
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            props.push("on" + a, attrs[a]);
                        } else if (typeof attrs[a] === "boolean") {
                            attrs[a] && props.push(a, "");
                        } else {
                            props.push(a, attrs[a]);
                        }
                }
            }
        }
        if (classes.length) {
            props.unshift("class", classes.join(" "));
        }
        if (id) {
            props.unshift("id", id);
        }
        idom.elementOpen(tag, attrs._key || null, null, ...props);
        if (attrs._skip) {
            idom.skip();
        }
        if (ctx && ref) {
            ctx.refs[ref] = idom.currentElement();
        }
        if (widget && widget.mount && widget.mount.constructor === Function) {
            widget.mount(idom.currentElement());
            idom.skip();
        }
        return attrs._skip ? true : false;
    }

    close(tag: string, children: Hsmls, ctx?: any): void {
        idom.elementClose(tag);
    }

    text(text: string, ctx?: any): void {
        idom.text(text);
    }

    fnc(fnc: HsmlFnc, ctx?: any): void {
        const skip = fnc(idom.currentElement());
        skip && idom.skip();
    }

    obj(obj: HsmlObj, ctx?: any): void {
        if ("toHsml" in obj) {
            hsml(obj.toHsml(), this, obj);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

function hsml2idom(hml: Hsml, ctx?: any): void {
    hsml(hml, new JsonmlIDomHandler(), ctx);
}


function hsmls2idom(hmls: Hsmls, ctx?: any): void {
    for (const hml of hmls) {
        if (hml.constructor === String) {
            idom.text(hml as string);
        } else if ("toHsml" in (hml as any)) {
            const obj = hml as HsmlObj;
            hsml2idom(obj.toHsml(), obj);
        } else {
            hsml2idom(hml as Hsml, ctx);
        }
    }
}


export function hsml2idomPatch(node: Element, hml: Hsml, ctx?: any): void {
    idom.patch(node,
        (data: Hsml) => hsml2idom(data, ctx), hml);
}

export function hsmls2idomPatch(node: Element, hmls: Hsmls, ctx?: any): void {
    idom.patch(node,
        (data: Hsmls) => hsmls2idom(data, ctx), hmls);
}
