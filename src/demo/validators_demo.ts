import {
    StringValidator,
    NumberValidator,
    DateValidator,
    FormValidator
} from "../main/validators";
import * as moment from "moment";

const sv = new StringValidator(
    {
        required: true,
        min: 3,
        max: 5,
        regexp: /[0123]+/
    },
    {
        required: "required msg",
        invalid_format: "invalid_format msg",
        not_in_range: "not_in_range msg"
    });

["x1234", "x1234y", "xy"].forEach(v => {
    console.log(v);
    const r = sv.validate(v);
    console.log(r);
    if (r.obj) {
        const f = sv.format(r.obj);
        console.log(f);
    }
});

console.log();

const nv = new NumberValidator(
    {
        required: true,
        min: 3,
        max: 500,
        // locale: "sk"
    },
    {
        required: "required msg",
        invalid_format: "invalid_format msg",
        not_in_range: "not_in_range msg"
    });

["123", "1234y", "xy"].forEach(v => {
    console.log(v);
    const r = nv.validate(v);
    console.log(r);
    if (r.obj) {
        const f = nv.format(r.obj);
        console.log(f);
    }
});

console.log();

const dv = new DateValidator(
    {
        required: true,
        locale: "sk",
        format: "L LT",
        min: moment("03/01/2017", "L", "en"),
        max: moment("03/01/2020", "L", "en")
        // parsedValue: ""
    },
    {
        required: "required msg",
        invalid_format: "invalid_format msg",
        not_in_range: "not_in_range msg"
    });

["01.03.2018 5:35", "5:35", "01.13.2018", "03/01/2018"].forEach(v => {
    console.log(v);
    const r = dv.validate(v);
    console.log(r);
    if (r.obj) {
        const f = dv.format(r.obj);
        console.log(f);
    }
});

console.log();

const d = { code: "123a", num: "33" };

const fv = new FormValidator<typeof d>()
    .addValidator("code", sv)
    .addValidator("num", nv);
const fvr = fv.validate(d);
console.log(fvr);
const fvf = fv.format(fvr.obj);
console.log(fvf);
