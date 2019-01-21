
export type HsmlHead = string; // "tag#id.class1.class2~handler"

export type HsmlAttrClasses = Array<string | [string, boolean]>;

export type HsmlAttrStyles = { [key: string]: string };

export type HsmlAttrData = { [key: string]: string | number | Array<any> | Object };

export type HsmlAttrOnDataFnc = (e: Event) => any;

export type HsmlAttrOnData = string | number | Array<any> | Object | HsmlAttrOnDataFnc;

export type HsmlAttrOn =
    | [keyof HTMLElementEventMap, EventListener]
    | [keyof HTMLElementEventMap, string, HsmlAttrOnData?]
    | Array<
        | [keyof HTMLElementEventMap, EventListener]
        | [keyof HTMLElementEventMap, string, HsmlAttrOnData?]
    >;

export interface HsmlAttrs {
    readonly _id?: string;
    readonly _classes?: string[];
    readonly _ref?: string;
    readonly _key?: string;
    readonly _skip?: boolean;
    readonly classes?: HsmlAttrClasses;
    readonly styles?: HsmlAttrStyles;
    readonly data?: HsmlAttrData;
    readonly on?: HsmlAttrOn;
    readonly [key: string]:
        | string
        | string[]
        | number
        | boolean
        | HsmlAttrClasses
        | HsmlAttrStyles
        // | HsmlAttrData
        | HsmlAttrOn
        | EventListener
        | HsmlObj;
}

export type HsmlFnc = (e?: Element) => boolean | void;

export interface HsmlObj {
    toHsml?(): Hsml;
}

export interface Hsmls extends Array<Hsml> { }

export type HsmlTagAttrN = [HsmlHead, (Hsmls | HsmlFnc
    | string | boolean | number | Date)?];
export type HsmlTagAttrY = [HsmlHead, HsmlAttrs, (Hsmls | HsmlFnc
    | string | boolean | number | Date)?];

export type HsmlTag = HsmlTagAttrN | HsmlTagAttrY;

export type Hsml = string | boolean | number | Date | HsmlFnc | HsmlObj | HsmlTag;

export interface HsmlHandler<C> {
    open(tag: string, attrs: HsmlAttrs, children: Hsmls, ctx?: C): boolean;
    close(tag: string, children: Hsmls, ctx?: C): void;
    text(text: string, ctx?: C): void;
    fnc(fnc: HsmlFnc, ctx?: C): void;
    obj(obj: HsmlObj, ctx?: C): void;
}

export function hsml<C = any>(hml: Hsml, handler: HsmlHandler<C>, ctx?: C): void {
    // console.log("hsml", hsml);
    if (hml === undefined) {
        return;
    }
    switch (hml.constructor) {
        case Array:
            // const tag = hml as HsmlTag;
            // if (
            //     (
            //         tag.length === 1 &&
            //         tag[0].constructor === String
            //     ) ||
            //     (
            //         tag.length === 2 &&
            //         (
            //             tag[0].constructor === String &&
            //             tag[1].constructor === Array
            //         ) ||
            //         (
            //             tag[0].constructor === String &&
            //             tag[1].constructor === Object
            //         )
            //     ) ||
            //     (
            //         tag.length === 3 &&
            //         tag[0].constructor === String &&
            //         tag[1].constructor === Object &&
            //         tag[2].constructor === Array
            //     )
            // ) {
            //     hsmlTag(hml as HsmlTag, handler, ctx);
            // } else {
            //     throw Error(`error parse tag: ${JSON.stringify(hml)}`);
            // }
            hsmlTag(hml as HsmlTag, handler, ctx);
            break;
        case Function:
            handler.fnc(hml as HsmlFnc, ctx);
            break;
        case String:
            handler.text(hml as string, ctx);
            break;
        case Boolean:
            handler.text("" + hml, ctx);
            break;
        case Number:
            const n = hml as number;
            const ns = n.toLocaleString ? n.toLocaleString() : n.toString();
            handler.text(ns, ctx);
            break;
        case Date:
            const d = hml as number;
            const ds = d.toLocaleString ? d.toLocaleString() : d.toString();
            handler.text(ds, ctx);
            break;
        default:
            handler.obj(hml as HsmlObj, ctx);
    }

    function hsmlTag(hmlTag: HsmlTag, handler: HsmlHandler<C>, ctx?: C): void {
        // console.log("hsml tag", hmlTag);

        const head = hmlTag[0] as HsmlHead;
        const attrsObj = hmlTag[1] as any;
        const hasAttrs = attrsObj && attrsObj.constructor === Object;
        const childIdx = hasAttrs ? 2 : 1;

        let children: Hsmls = [];
        let hsmlFnc: HsmlFnc;

        const htc = hmlTag[childIdx];
        switch (htc && htc.constructor) {
            case Array:
                children = htc as Hsmls;
                break;
            case Function:
                hsmlFnc = htc as HsmlFnc;
                break;
            case String:
            case Boolean:
            case Number:
            case Date:
                children = [htc as Hsml];
                break;
        }

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
            attrs = {} as HsmlAttrs;
        }

        if (id) {
            (attrs as any)._id = id;
        }
        if (classes.length) {
            (attrs as any)._classes = classes;
        }
        if (ref) {
            (attrs as any)._ref = ref;
        }

        const skip = handler.open(tag, attrs, children, ctx);

        if (!skip) {
            children.forEach(jml => hsml(jml, handler, ctx));
        }

        hsmlFnc && handler.fnc(hsmlFnc, ctx);

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

// const hsmls: Hsmls = [
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

// const hml: Hsml = ["xxx", {}, [
//         "types", " ", 1235.456, " ", new Date(), " ",
//         ...hsmls,
//         ["t", ["t", "a", ""]],
//         ["t", {}, ["t", "a", ""]]
//     ]];

// console.log(hsmls, hml);

// const hml: Hsml = ["ppp", [
//     ["sss", [
//         ["aaa"]
//     ]]
// ]];
// console.log(hml);
