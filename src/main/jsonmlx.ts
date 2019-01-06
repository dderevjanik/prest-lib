
export type JsonMLHead = string; // "tag#id.class1.class2~handler"

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
        | boolean
        | { [key: string]: string }
        | Array<string | [string, boolean]>;
}

export type JsonMLFnc = (e?: Element) => boolean | void;

export interface JsonMLObj {
    toJsonML?(): JsonML;
}

export interface JsonMLs extends Array<JsonML> {}

export type JsonMLTagAttrNo = [JsonMLHead, JsonMLs?];
export type JsonMLTagAttrYes = [JsonMLHead, JsonMLAttrs, JsonMLs?];

export type JsonMLTag =  JsonMLTagAttrNo | JsonMLTagAttrYes;

export type JsonML = string | number | boolean | JsonMLFnc | JsonMLObj | JsonMLTag;

export interface JsonMLHandler {
    open(tag: string, attrs: JsonMLAttrs, children: JsonMLs, ctx?: any): boolean;
    close(tag: string, children: JsonMLs, ctx?: any): void;
    text(text: string, ctx?: any): void;
    fnc(fnc: JsonMLFnc, ctx?: any): void;
    obj(obj: JsonMLObj, ctx?: any): void;
}

export function jsonml(jsonML: JsonML, handler: JsonMLHandler, ctx?: any): void {
    console.log("jsonml", jsonML);
    if (jsonML === undefined) {
        return;
    }
    switch (jsonML.constructor) {
        case Array:
            const tag = jsonML as JsonMLTag;
            if (
                (
                    tag.length === 1 &&
                    tag[0].constructor === String
                ) ||
                (
                    tag.length === 2 &&
                    tag[0].constructor === String &&
                    tag[1].constructor === Array
                ) ||
                (
                    tag.length === 3 &&
                    tag[0].constructor === String &&
                    tag[1].constructor === Object &&
                    tag[2].constructor === Array
                )
            ) {
                jsonmlTag(jsonML as JsonMLTag, handler, ctx);
            } else {
                throw Error(`error parse tag: ${JSON.stringify(jsonML)}`);
            }
            break;
        case Function:
            handler.fnc(jsonML as JsonMLFnc, ctx);
            break;
        case String:
            handler.text(jsonML as string, ctx);
            break;
        case Number:
            handler.text("" + jsonML, ctx);
            break;
        case Boolean:
            handler.text("" + jsonML, ctx);
            break;
        default:
            handler.obj(jsonML as JsonMLObj, ctx);
    }

    function jsonmlTag(jsonML: JsonMLTag, handler: JsonMLHandler, ctx?: any): void {
        console.log("jsonmlTag", jsonML);

        const head = jsonML[0] as JsonMLHead;
        const attrsObj = jsonML[1] as any;
        const hasAttrs = attrsObj && attrsObj.constructor === Object;
        const childIdx = hasAttrs ? 2 : 1;
        const children = (jsonML[childIdx] || []) as JsonMLs;

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
            children.forEach(jml => jsonml(jml, handler, ctx));
        }

        handler.close(tag, children, ctx);
    }
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

// Test

// const jmls: JsonMLs = [
//     "text",
//     ["tag", [
//         "d",
//         [""]
//     ]],
//     ["taga", { attr: "attr", classes: ["class"] }, [
//         "text",
//         123,
//         true
//     ]]
// ];

// const jml: JsonML = ["xxx", {}, [
//         "d",
//         ...jmls,
//         ["t", ["t", "a", ""]],
//         ["t", {}, ["t", "a", ""]]
//     ]];

// console.log(jmls, jml);
