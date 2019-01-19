import {
    jsonml,
    JsonML,
    JsonMLs,
    JsonMLAttrs,
    JsonMLFnc,
    JsonMLObj,
    JsonMLHandler
} from "./jsonml";
import * as idom from "incremental-dom";

class JsonmlIDomHandler implements JsonMLHandler {

    open(tag: string, attrs: JsonMLAttrs, children: number, ctx?: any): boolean {
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

    close(tag: string, children: number, ctx?: any): void {
        idom.elementClose(tag);
    }

    text(text: string, ctx?: any): void {
        idom.text(text);
    }

    fnc(fnc: JsonMLFnc, ctx?: any): void {
        const skip = fnc(idom.currentElement());
        skip && idom.skip();
    }

    obj(obj: JsonMLObj, ctx?: any): void {
        if ("toJsonML" in obj) {
            jsonml(obj.toJsonML(), this, obj);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

function jsonml2idom(jsonML: JsonML, ctx?: any): void {
    jsonml(jsonML, new JsonmlIDomHandler(), ctx);
}


function jsonmls2idom(jsonMLs: JsonMLs, ctx?: any): void {
    for (const jsonML of jsonMLs) {
        if (jsonML.constructor === String) {
            idom.text(jsonML as string);
        } else if ("toJsonML" in (jsonML as any)) {
            const obj = jsonML as JsonMLObj;
            jsonml2idom(obj.toJsonML(), obj);
        } else {
            jsonml2idom(jsonML as JsonML, ctx);
        }
    }
}


export function jsonml2idomPatch(node: Element, jsonML: JsonML, ctx?: any): void {
    idom.patch(node,
        (data: JsonML) => jsonml2idom(data, ctx), jsonML);
}

export function jsonmls2idomPatch(node: Element, jsonMLs: JsonMLs, ctx?: any): void {
    idom.patch(node,
        (data: JsonMLs) => jsonmls2idom(data, ctx), jsonMLs);
}
