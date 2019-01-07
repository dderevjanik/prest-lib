export type HsmlHead = string; // "tag#id.class1.class2~handler"

export interface HsmlAttrs {
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
        | HsmlObj;
}

export type HsmlFnc = (e?: Element) => boolean | void;

export interface HsmlObj {
    toHsml?(): Hsml;
}

export interface Hsmls extends Array<Hsml> { }

export type HsmlTagAttrNo = [HsmlHead, Hsmls?];
export type HsmlTagAttrYes = [HsmlHead, HsmlAttrs, Hsmls?];

export type HsmlTag = HsmlTagAttrNo | HsmlTagAttrYes;

export type Hsml = string | number | boolean | HsmlFnc | HsmlObj | HsmlTag;

export interface HsmlHandler {
    open(tag: string, attrs: HsmlAttrs, children: Hsmls, ctx?: any): boolean;
    close(tag: string, children: Hsmls, ctx?: any): void;
    text(text: string, ctx?: any): void;
    fnc(fnc: HsmlFnc, ctx?: any): void;
    obj(obj: HsmlObj, ctx?: any): void;
}

export function hsml(hml: Hsml, handler: HsmlHandler, ctx?: any): void {
    // console.log("hsml", hsml);
    if (hml === undefined) {
        return;
    }
    switch (hml.constructor) {
        case Array:
            const tag = hml as HsmlTag;
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
                hsmlTag(hml as HsmlTag, handler, ctx);
            } else {
                throw Error(`error parse tag: ${JSON.stringify(hml)}`);
            }
            break;
        case Function:
            handler.fnc(hml as HsmlFnc, ctx);
            break;
        case String:
            handler.text(hml as string, ctx);
            break;
        case Number:
            handler.text("" + hml, ctx);
            break;
        case Boolean:
            handler.text("" + hml, ctx);
            break;
        default:
            handler.obj(hml as HsmlObj, ctx);
    }

    function hsmlTag(hmlTag: HsmlTag, handler: HsmlHandler, ctx?: any): void {
        // console.log("hsml tag", hmlTag);

        const head = hmlTag[0] as HsmlHead;
        const attrsObj = hmlTag[1] as any;
        const hasAttrs = attrsObj && attrsObj.constructor === Object;
        const childIdx = hasAttrs ? 2 : 1;
        const children = (hmlTag[childIdx] || []) as Hsmls;

        const refSplit = head.split("~");
        const ref = refSplit[1];
        const dotSplit = refSplit[0].split(".");
        const hashSplit = dotSplit[0].split("#");
        const tag = hashSplit[0] || "div";
        const id = hashSplit[1];
        const classes = dotSplit.slice(1);

        let attrs: HsmlAttrs;
        if (hasAttrs) {
            attrs = attrsObj as HsmlAttrs;
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
            children.forEach(jml => hsml(jml, handler, ctx));
        }

        handler.close(tag, children, ctx);
    }
}

export function join(hsmls: Hsmls, sep: string | Hsml): Hsmls {
    const r = hsmls
        .reduce<Hsmls>(
            (prev, cur) => {
                prev.push(cur, sep);
                return prev;
            },
            [] as Hsmls
        );
    r.splice(-1);
    return r;
}

// Test

// const jmls: Hsmls = [
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

// const jml: Hsml = ["xxx", {}, [
//         "d",
//         ...jmls,
//         ["t", ["t", "a", ""]],
//         ["t", {}, ["t", "a", ""]]
//     ]];

// console.log(jmls, jml);
