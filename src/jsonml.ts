
export type JsonMLHead = string;

export interface JsonMLAttrs {
    _id?: string;
    _classes?: string[];
    _ref?: string;
    _key?: string;
    _skip?: boolean;
    data?: { [key: string]: any };
    styles?: { [key: string]: string };
    classes?: Array<string | [string, boolean]>;
    [key: string]: string
        | string[]
        | number
        | boolean
        | { [key: string]: string | number | Array<string> | Object }
        | Array<string | [string, boolean]>
        | ((e: Event) => void)
        | JsonMLObj;
}

export type JsonMLFnc = (e?: Element) => boolean | void;

export interface JsonMLObj {
    toJsonML?(): JsonML;
}

export interface JsonML extends Array<JsonMLHead | JsonMLAttrs | JsonMLFnc | JsonMLObj | JsonML> {
    // 0: string;
    // 1?: Attrs | string | JsonML | JsonMLFnc | JsonMLObj;
    // 2?: string | JsonML | JsonMLFnc | JsonMLObj;
    // [i: number]: string | JsonMLFnc | JsonMLObj | JsonML;
    // [i: number]: Attrs | string | JsonMLFnc | JsonMLObj | JsonML;
}

export interface JsonMLs extends Array<string | JsonMLFnc | JsonMLObj | JsonML> {
    // [i: number]: string | JsonMLFnc | JsonMLObj | JsonML;
}

export interface JsonMLHandler {
    open(tag: string, attrs: JsonMLAttrs, children: number, ctx?: any): boolean;
    close(tag: string, children: number, ctx?: any): void;
    text(text: string, ctx?: any): void;
    fnc(fnc: JsonMLFnc, ctx?: any): void;
    obj(obj: JsonMLObj, ctx?: any): void;
}

export function jsonml(jsonML: JsonML, handler: JsonMLHandler, ctx?: any): void {
    if (!jsonML) {
        return;
    }

    if (jsonML.length === 0 || typeof jsonML[0] !== "string") {
        throw `jsonml parse error: ${JSON.stringify(jsonML)}`;
    }

    const head = jsonML[0] as JsonMLHead;
    const attrsObj = jsonML[1] as any;
    const hasAttrs = attrsObj && attrsObj.constructor === Object;
    const childIdx = hasAttrs ? 2 : 1;

    let children = 0;
    for (let i = childIdx; i < jsonML.length; i++) {
        if (jsonML[i] && jsonML[i].constructor !== Function) {
            children++;
        }
    }

    const refSplit = head.split("~");
    const ref = refSplit[1];
    const dotSplit = refSplit[0].split(".");
    const hashSplit = dotSplit[0].split("#");
    const tag = hashSplit[0] || "div";
    const id = hashSplit[1];
    const classes = dotSplit.slice(1);

    let attrs: JsonMLAttrs;
    if (hasAttrs) {
        attrs = attrsObj as JsonMLAttrs;
    } else {
        attrs = {};
    }

    if (id) {
        attrs._id = id;
    }
    if (classes.length) {
        attrs._classes = classes;
    }
    if (ref) {
        attrs._ref = ref;
    }

    const skip = handler.open(tag, attrs, children, ctx);

    if (!skip) {
        for (let i = childIdx, l = jsonML.length; i < l; i++) {
            const jml = jsonML[i] as any;
            if (jml === undefined) {
                continue;
            }
            switch (jml.constructor) {
                case Array:
                    jsonml(jml, handler, ctx);
                    break;
                case Function:
                    handler.fnc(jml, ctx);
                    break;
                case String:
                    handler.text(jml, ctx);
                    break;
                case Number:
                    handler.text("" + jml, ctx);
                    break;
                case Boolean:
                    handler.text("" + jml, ctx);
                    break;
                default:
                    handler.obj(jml, ctx);
            }
        }
    }

    handler.close(tag, children, ctx);
}

export function join(jsonmls: JsonMLs, sep: string | JsonML): JsonMLs {
    const r = jsonmls
        .reduce<JsonMLs>(
            (prev, cur) => {
                prev.push(cur, sep);
                return prev;
            },
            [] as JsonMLs
        );
    r.splice(-1);
    return r;
}

// Experiments

// export type JsonML = JsonMlNoAttr | JsonMlAttr;
// export type JsonML = string | JsonMLFnc | JsonMLObj | JsonMlNoAttr | JsonMlAttr;
// type JsonML1 = [
//     string,
//     (string | JsonMLFnc | JsonMLObj | JsonML)?
// ];
// type JsonML2 = [
//     string,
//     Attrs,
//     (string | JsonMLFnc | JsonMLObj | JsonML)?
// ];
// export interface JsonMlNoAttr extends Array<string | JsonMLFnc | JsonMLObj | JsonML> {
//     // 0: string;
//     // [i: number]: string | JsonMLFnc | JsonMLObj | JsonML;
// }
// export interface JsonMlAttr extends Array<string | Attrs | JsonMLFnc | JsonMLObj | JsonML> {
//     // 0: string;
//     // 1: Attrs;
//     // [i: number]: Attrs | string | JsonMLFnc | JsonMLObj | JsonML;
// }

// const xs: XJsonMLs = ["xxx", ["d", []], "x", ["t", {}, []]];
// const x: XJsonMlEl = ["xxx", {}, [
//         "d",
//         ...xs,
//         ["t", ["t", "a", ""]],
//         ["t", {}, ["t", "a", ""]]
//     ]];
// console.log(x, xs);

// export type Tag = string;
// export type XJsonMlEl = XJsonMlElNoAttr | XJsonMlElAttr;
// export type XJsonMlElNoAttr = [Tag, XJsonMlFrag?];
// export type XJsonMlElAttr = [Tag, Attrs, XJsonMlFrag?];
// export interface XJsonMlFrag extends Array<string | XJsonMlEl> {}
// export type XJsonMLs = Array<string | XJsonMlEl>;
