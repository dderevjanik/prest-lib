import * as numeral from "numeral";
import * as moment from "moment";
import { Moment } from "moment";

const requiredMsg = "required";
const notInRangeMsg = "not_in_range";
const invalidFormatMsg = "invalid_format";
const invalidOptionMsg = "invalid_option";
const localeDefault = "en";
const dateFormatFefault = "L";
const numFormatDefault = "0,0.[00]";

export abstract class Validator<T, O, M> {

    readonly opts: O;
    readonly msgs: M;

    readonly str: string;
    readonly err: string;
    readonly obj: T;

    constructor(opts?: O, msgs?: M) {
        this.opts = opts;
        this.msgs = msgs;
    }

    protected abstract strToObj(str: string): { obj?: T, err?: string };

    protected abstract objCheck(obj: T): string;

    protected abstract objToStr(obj: T, format?: string): { str?: string, err?: string };

    validate(str: string): { str?: string, obj?: T, err?: string } {
        (this.str as any) = str;
        const ots = this.strToObj(str);
        (this.obj as any) = ots.obj;
        if (ots.err) {
            (this.err as any) = ots.err;
            return { str, obj: ots.obj, err: ots.err };
        }
        const err = this.objCheck(ots.obj);
        (this.err as any) = err;
        return { str, obj: ots.obj, err };
    }

    format(obj: T, format?: string): { str?: string, err?: string } {
        const err = this.objCheck(obj);
        const ots = this.objToStr(obj, format);
        return { str: ots.str, err: ots.err ? ots.err : err };
    }

}

export interface SelectValidatorOpts {
    required?: boolean;
    options?: string[];
}

export interface SelectValidatorMsgs {
    required?: string;
    invalid_option?: string;
}

export class SelectValidator extends Validator<string, SelectValidatorOpts, SelectValidatorMsgs> {

    constructor(opts?: SelectValidatorOpts, msgs?: SelectValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                options: opts.options && opts.options.join(", ")
                            })
                        : requiredMsg
                };
            }
        }
        return { obj: str };
    }

    protected objCheck(obj: string): string {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("options" in opts) {
            if (opts.options.indexOf(obj) === -1) {
                return msgs && msgs.invalid_option
                    ? tpl(msgs.invalid_option,
                        {
                            option: obj,
                            options: opts.options && opts.options.join(", ")
                        })
                    : invalidOptionMsg;
            }
        }
        return "";
    }

    protected objToStr(obj: string, format?: string): { str?: string, err?: string } {
        return { str: obj };
    }

}

export interface StringValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
    regexp?: RegExp;
}

export interface StringValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class StringValidator extends Validator<string, StringValidatorOpts, StringValidatorMsgs> {

    constructor(opts?: StringValidatorOpts, msgs?: StringValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                min: opts.min && ("" + opts.min),
                                max: opts.max && ("" + opts.max),
                                regexp: opts.regexp && ("" + opts.regexp)
                            })
                        : requiredMsg
                };
            }
        }
        if ("regexp" in opts) {
            if (!str.match(opts.regexp)) {
                return {
                    err: msgs && msgs.invalid_format
                        ? tpl(msgs.invalid_format,
                            {
                                regexp: opts.regexp && ("" + opts.regexp)
                            })
                        : invalidFormatMsg
                    };
            }
        }
        return { obj: str };
    }

    protected objCheck(obj: string): string {
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean;
        if ("max" in opts) {
            if (obj.length > opts.max) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.length < opts.min) {
                err = true;
            }
        }
        if ("min" in opts && "max" in opts) {
            if (obj.length > opts.max && obj.length < opts.min) {
                err = true;
            }
        }
        if (err) {
            return msgs && msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: opts.min && ("" + opts.min),
                        max: opts.max && ("" + opts.max)
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: string, format?: string): { str?: string, err?: string } {
        return { str: obj };
    }

}

export const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export interface NumberValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
    locale?: string;
    format?: string;
    strict?: boolean;
}

export interface NumberValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class NumberValidator extends Validator<Numeral, NumberValidatorOpts, NumberValidatorMsgs> {

    constructor(opts?: NumberValidatorOpts, msgs?: NumberValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: Numeral, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                min: opts.min && ("" + opts.min),
                                max: opts.max && ("" + opts.max),
                                locale: opts.locale || localeDefault,
                                format: opts.format || numFormatDefault
                            })
                        : requiredMsg
                };
            }
        }
        numeral.locale(opts.locale || localeDefault);
        const n = numeral(str);
        let err: boolean;
        if (n.value() === null) {
            err = true;
        }
        if (opts.strict && (str !== this.objToStr(n).str)) {
            err = true;
        }
        if (err) {
            const num = (n.value() !== null) ? n : numeral(1234.45);
            return {
                obj: (n.value() !== null) ? n : undefined,
                err: msgs && msgs.invalid_format
                    ? tpl(msgs.invalid_format,
                        {
                            num: this.objToStr(num).str,
                            locale: opts.locale || localeDefault,
                            format: opts.format || numFormatDefault
                        })
                    : invalidFormatMsg
                };
        }
        return { obj: n };
    }

    protected objCheck(obj: Numeral): string {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean;
        if ("max" in opts) {
            if (obj.value() > opts.max) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.value() < opts.min) {
                err = true;
            }
        }
        if (err) {
            return msgs && msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: opts.min && ("" + opts.min),
                        max: opts.max && ("" + opts.max),
                        locale: opts.locale || localeDefault,
                        format: opts.format || numFormatDefault
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: Numeral, format?: string): { str?: string, err?: string } {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
        numeral.locale(this.opts.locale || localeDefault);
        return {
            str: obj
                ? obj.format(format ? format : this.opts.format || numFormatDefault)
                : undefined
        };
    }

}

export interface DateTimeValidatorOpts {
    required?: boolean;
    min?: moment.Moment;
    max?: moment.Moment;
    locale?: string;
    format?: string;
    strict?: boolean;
}

export interface DateTimeValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class DateTimeValidator extends Validator<Moment, DateTimeValidatorOpts, DateTimeValidatorMsgs> {

    constructor(opts?: DateTimeValidatorOpts, msgs?: DateTimeValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: Moment, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                min: opts.min && ("" + opts.min),
                                max: opts.max && ("" + opts.max),
                                locale: opts.locale || localeDefault,
                                format: opts.format && opts.format
                            })
                        : requiredMsg
                };
            }
        }
        const d = moment(str,
            opts && (opts.format || dateFormatFefault),
            opts && (opts.locale || localeDefault),
            opts.strict || false);
        let err: boolean;
        if (!d.isValid()) {
            err = true;
        }
        if (opts.strict && (str !== this.objToStr(d).str)) {
            err = true;
        }
        if (err) {
            const date = d.isValid() ? d : moment(new Date());
            return {
                obj: d.isValid() ? d : undefined,
                err: msgs && msgs.invalid_format
                    ? tpl(msgs.invalid_format,
                        {
                            date: this.objToStr(date).str,
                            locale: opts.locale || localeDefault,
                            format: opts.format && opts.format
                        })
                    : invalidFormatMsg
                };
        }
        return { obj: d };
    }

    protected objCheck(obj: Moment): string {
        if (obj.constructor === Date) {
            obj = moment(obj);
        }
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean;
        if ("max" in opts) {
            if (obj.isAfter(opts.max)) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.isBefore(opts.min)) {
                err = true;
            }
        }
        if (err) {
            return msgs && msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: opts.min && ("" + opts.min),
                        max: opts.max && ("" + opts.max),
                        locale: opts.locale && opts.locale,
                        format: opts.format && opts.format
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: Moment, format?: string): { str?: string, err?: string } {
        if (obj.constructor === Date) {
            obj = moment(obj);
        }
        return {
            str: obj
                ? obj
                    .locale(this.opts.locale || localeDefault)
                    .format(format ? format : this.opts.format || dateFormatFefault)
                : undefined
        };
    }

}

interface ValidatorOrObject {
    [key: string]: Validator<any, any, any> | ObjectValidator<any>;
}

type DeepOV<O, T> = {
    0: T,
    1: O extends ObjectValidator<infer OV>
        ? { [P in keyof OV]: DeepOV<OV[P], T> }
        : never;
    2: { [P in keyof O]: DeepOV<O[P], T>}
}[O extends Validator<any, any, any>
    ? 0
    : O extends ObjectValidator<any>
        ? 1
        : O extends { [prop: string]: any }
            ? 2
            : 0];

export class ObjectValidator<T extends ValidatorOrObject> {

    readonly validators: ValidatorOrObject;

    readonly str: DeepOV<T, string>;
    readonly obj: { [key in keyof T]: any };
    readonly err: { [key in keyof T]: string };
    readonly valid: boolean;

    constructor(validators: T) {
        this.validators = validators;
    }

    validate(data: DeepOV<T, string>, defaults?: DeepOV<T, string>): this {
        const inputData = { ...defaults, ...data };
        const result = Object.keys(this.validators)
            .reduce(
                (acc, prop) => {
                    const value = inputData[prop];
                    const validator = this.validators[prop];
                    const res = validator instanceof ObjectValidator
                        ? validator.validate(value)
                        : validator.validate(value as any);
                    acc.str[prop] = res.str;
                    acc.obj[prop] = res.obj;
                    (acc.err as any)[prop] = res.err;
                    return acc;
                },
                { str: {} as any, obj: {} as any, err: {} as any, valid: false });

        result.valid = !Object.keys(result.err).filter(x => !!(result.err as any)[x]).length;
        (this.str as any) = result.str;
        (this.obj as any) = result.obj;
        (this.err as any) = result.err;
        (this.valid as any) = result.valid;
        return this;
    }

    format(data: DeepOV<T, string>): this {
        const result = Object.keys(this.validators)
            .reduce(
                (acc, prop) => {
                    const value = (data as any)[prop];
                    const validator = this.validators[prop];
                    const res = validator.format(value);
                    acc.str[prop] = res.str;
                    acc.obj[prop] = value;
                    res.err && ((acc.err as any)[prop] = res.err);
                    return acc;
                },
                { str: {} as any, obj: {} as any, err: {} as any, valid: false });
        result.valid = !Object.keys(result.err).filter(x => !!(result.err as any)[x]).length;
        (this.str as any) = result.str;
        (this.obj as any) = result.obj;
        (this.err as any) = result.err;
        (this.valid as any) = result.valid;
        return this;
    }

}

function tpl(tmpl: string, data: { [k: string]: string }): string {
    return Object.keys(data)
        .map(k => [k, data[k]])
        .reduce((t, d) => t.replace(new RegExp(`\\$\\{${d[0]}\\}`, "g"), d[1]), tmpl);
}

// TEST

// import "numeral/locales";

// const sv = new StringValidator(
//     {
//         required: true,
//         min: 3,
//         max: 5,
//         regexp: /[0123]+/
//     },
//     {
//         required: "required ${min} ${max} ${regexp}",
//         invalid_format: "invalid_format ${regexp}",
//         not_in_range: "not_in_range ${min} ${max}"
//     });

// [
//     "x1234",
//     "x1234y",
//     "xy"
// ].forEach(v => {
//     console.log();
//     console.log(v);
//     const r = sv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = sv.format(r.obj);
//         console.log(f);
//     }
// });

// console.log();

// const nv = new NumberValidator(
//     {
//         required: true,
//         min: 3,
//         max: 5000,
//         locale: "sk",
//         format: "0,0.0[00]",
//         strict: true
//     },
//     {
//         required: "required ${min} ${max} ${locale} ${format}",
//         invalid_format: "invalid_format ${num} ${locale} ${format}",
//         not_in_range: "not_in_range ${min} ${max} ${locale}"
//     });

// [
//     "1234,56",
//     "1 234,56",
//     "1 234,56y",
//     "xy"
// ].forEach(v => {
//     console.log();
//     console.log(v);
//     const r = nv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = nv.format(r.obj);
//         console.log(f);
//     }
// });

// console.log();

// const dv = new DateTimeValidator(
//     {
//         required: true,
//         locale: "sk",
//         format: "l LT",
//         min: moment("03/01/2017", "L", "en"),
//         max: moment("03/01/2020", "L", "en"),
//         strict: true
//     },
//     {
//         required: "required ${min} ${max} ${locale} ${format}",
//         invalid_format: "invalid_format ${date} ${locale}",
//         not_in_range: "not_in_range ${min} ${max} ${locale} ${format}"
//     });

// [
//     "01.03.2018 5:35",
//     "1.3.2018 5:35",
//     "5:35",
//     "01.13.2018",
//     "1.13.2018",
//     "03/01/2018",
//     "3/1/2018"
// ].forEach(v => {
//     console.log();
//     console.log(v);
//     const r = dv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = dv.format(r.obj);
//         console.log(f);
//     }
// });

// console.log();

// const data = { str: "111", num: "12,34", user: { name: '1222', email: '144' } };

// const ov = new ObjectValidator({
        // str: sv,
        // num: nv,
        // date: dv,
//         user: new ObjectValidator({
//             name: sv,
//             email: sv
//         })
//     })
//     .validate(data);
// console.log(ov.valid);
// console.log(ov.err);

// console.log(ov);

// ov.format(ov.obj);
// console.log(ov);
