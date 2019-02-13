import "jasmine";
import { NumberValidator } from "../../src/validators";

describe("NumberValidator", () => {

    // required

    it("should test required option", () => {
        const nv = new NumberValidator({
            required: true
        });

        const result = nv.validate("3");
        expect(result.err).toEqual("");
    });

    it("should test required option [ERROR]", () => {
        const nv = new NumberValidator({
            required: true
        });
        const result = nv.validate("");
        expect(result.err).toEqual("required");
    });

    // min

    it("should test min 62 with number 20 [ERROR]", () => {
        const nv = new NumberValidator({
            min: 62
        });
        const result = nv.validate("20");
        expect(result.err).toEqual("not_in_range");
    });

    it("should test min 62 with number -3 [ERROR]", () => {
        const nv = new NumberValidator({
            min: 62
        });
        const result = nv.validate("-3");
        expect(result.err).toEqual("not_in_range");
    });

    it("should test min 62 with number 61 [ERROR]", () => {
        const nv = new NumberValidator({
            min: 62
        });
        const result = nv.validate("61");
        expect(result.err).toEqual("not_in_range");
    });

    it("should test min 62 with number 62", () => {
        const nv = new NumberValidator({
            min: 62
        });
        const result = nv.validate("62");
        expect(result.err).toEqual("");
    });

    it("should test min 62 with number 63", () => {
        const nv = new NumberValidator({
            min: 62
        });
        const result = nv.validate("63");
        expect(result.err).toEqual("");
    });

    // max

    it("should test max 20 with number -11", () => {
        const nv = new NumberValidator({
            max: 20
        });
        const result = nv.validate("-11");
        expect(result.err).toEqual("");
    });

    it("should test max 20 with number 19", () => {
        const nv = new NumberValidator({
            max: 20
        });
        const result = nv.validate("19");
        expect(result.err).toEqual("");
    });

    it("should test max 20 with number 20", () => {
        const nv = new NumberValidator({
            max: 20
        });
        const result = nv.validate("20");
        expect(result.err).toEqual("");
    });

    it("should test max 20 with number 21 [ERROR]", () => {
        const nv = new NumberValidator({
            max: 20
        });
        const result = nv.validate("21");
        expect(result.err).toEqual("not_in_range");
    });

    // min && max

    it("should test range <0, 33> with number -1 [ERROR]", () => {
        const nv = new NumberValidator({
            min: 0,
            max: 33
        });
        const result = nv.validate("-1");
        expect(result.err).toEqual("not_in_range");
    });

    it("should test range <0, 33> with number 0", () => {
        const nv = new NumberValidator({
            min: 0,
            max: 33
        });
        const result = nv.validate("0");
        expect(result.err).toEqual("");
    });

    it("should test range <0, 33> with number 1", () => {
        const nv = new NumberValidator({
            min: 0,
            max: 33
        });
        const result = nv.validate("1");
        expect(result.err).toEqual("");
    });

    it("should test range <0, 33> with number 32", () => {
        const nv = new NumberValidator({
            min: 0,
            max: 33
        });
        const result = nv.validate("32");
        expect(result.err).toEqual("");
    });

    it("should test range <0, 33> with number 33", () => {
        const nv = new NumberValidator({
            min: 0,
            max: 33
        });
        const result = nv.validate("33");
        expect(result.err).toEqual("");
    });

    it("should test range <0, 33> with number 34 [ERROR]", () => {
        const nv = new NumberValidator({
            min: 0,
            max: 33
        });
        const result = nv.validate("34");
        expect(result.err).toEqual("not_in_range");
    });

    // format

    it("shoud use format '0,0.0[00]' for 1234,56", () => {
        const nv = new NumberValidator({
            format: "0,0.0[00]"
        });
        const result = nv.validate("1234,56");
        expect(result.str).toEqual("1234,56");
        expect(result.err).toEqual("");
    });

    it("shoud use format '0,0.0[00]' for 1 234,56", () => {
        const nv = new NumberValidator({
            format: "0,0.0[00]"
        });
        const result = nv.validate("1 234,56");
        expect(result.str).toEqual("1 234,56");
        expect(result.err).toEqual("");
    });

    // it("shoud use format '0,0.0[00]' for 1 234,56y", () => {
    //     const nv = new NumberValidator({
    //         format: "0,0.0[00]"
    //     });
    //     const result = nv.validate("1 234,56y");
    //     expect(result.str).toEqual("1 234,56y");
    //     expect(result.err).toEqual("");
    // });

    it("shoud use format '0,0.0[00]' for xy [ERROR]", () => {
        const nv = new NumberValidator({
            format: "0,0.0[00]"
        });
        const result = nv.validate("xy");
        expect(result.str).toEqual("xy");
        expect(result.err).toEqual("invalid_format");
    });

    it("shoud use format '0,0.0[00]' for xy [ERROR]", () => {
        const nv = new NumberValidator({
            format: "0,0.0[00]"
        });
        const result = nv.validate("32,1");
        expect(result.str).toEqual("32,1");
        expect(result.err).toEqual("");
    });

});
