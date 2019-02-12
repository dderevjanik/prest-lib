import "jasmine";
import { StringValidator } from "../src/validators";

describe("Validators test", () => {

    describe("StringValidator", () => {

        // required

        it("should test required option", () => {
            const sv = new StringValidator({
                required: true
            });
            const result = sv.validate("x");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("x");
            expect(result.obj).toEqual("x");
        });

        it("should test required option with empty string [ERROR]", () => {
            const sv = new StringValidator({
                required: true
            });
            const result = sv.validate("");
            expect(result.err).toEqual("required");
            expect(result.str).toEqual("");
            // expect(result.obj).toEqual(undefined);
        });

        // min

        it("should test min 5 option with string of length 6", () => {
            const sv = new StringValidator({
                min: 5
            });
            const result = sv.validate("abcdef");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("abcdef");
            expect(result.obj).toEqual("abcdef");
        });

        it("should test min 5 option with string of length 5", () => {
            const sv = new StringValidator({
                min: 5
            });
            const result = sv.validate("abcde");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("abcde");
            expect(result.obj).toEqual("abcde");
        });

        it("should test min 5 option with string of length 3 [ERROR]", () => {
            const sv = new StringValidator({
                min: 5
            });
            const result = sv.validate("def");
            expect(result.err).toEqual("not_in_range");
            expect(result.str).toEqual("def");
            expect(result.obj).toEqual("def");
        });

        // max

        it("should test max 8 option with string of length 0", () => {
            const sv = new StringValidator({
                max: 8
            });
            const result = sv.validate("");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("");
            expect(result.obj).toEqual("");
        });

        it("should test max 8 option with string of length 7", () => {
            const sv = new StringValidator({
                max: 8
            });
            const result = sv.validate("testtes");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("testtes");
            expect(result.obj).toEqual("testtes");
        });

        it("should test max 8 option with string of length 8", () => {
            const sv = new StringValidator({
                max: 8
            });
            const result = sv.validate("testtes8");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("testtes8");
            expect(result.obj).toEqual("testtes8");
        });

        it("should test max 8 option with string of length 9 [ERROR]", () => {
            const sv = new StringValidator({
                max: 8
            });
            const result = sv.validate("testtes8z");
            expect(result.err).toEqual("not_in_range");
            expect(result.str).toEqual("testtes8z");
            expect(result.obj).toEqual("testtes8z");
        });

        // min & max

        it("should test <min3, max7> with string of length 3", () => {
            const sv = new StringValidator({
                min: 3,
                max: 7
            });
            const result = sv.validate("cjs");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("cjs");
            expect(result.obj).toEqual("cjs");
        });

        it("should test <min3, max7> with string of length 5", () => {
            const sv = new StringValidator({
                min: 3,
                max: 7
            });
            const result = sv.validate("cjsts");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("cjsts");
            expect(result.obj).toEqual("cjsts");
        });

        it("should test <min3, max7> with string of length 7", () => {
            const sv = new StringValidator({
                min: 3,
                max: 7
            });
            const result = sv.validate("cjstsxh");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("cjstsxh");
            expect(result.obj).toEqual("cjstsxh");
        });

        it("should test <min3, max7> with string of length 8 [ERROR]", () => {
            const sv = new StringValidator({
                min: 3,
                max: 7
            });
            const result = sv.validate("cjstsxjs");
            expect(result.err).toEqual("not_in_range");
            expect(result.str).toEqual("cjstsxjs");
            expect(result.obj).toEqual("cjstsxjs");
        });

        it("should test <min3, max7> with string of length 2 [ERROR]", () => {
            const sv = new StringValidator({
                min: 3,
                max: 7
            });
            const result = sv.validate("py");
            expect(result.err).toEqual("not_in_range");
            expect(result.str).toEqual("py");
            expect(result.obj).toEqual("py");
        });

        // regexp

        it("should test only regexp digits", () => {
            const sv = new StringValidator({
                regexp: /[0123]+/
            });
            const result = sv.validate("3312");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("3312");
            expect(result.obj).toEqual("3312");
        });

        it("should test only regexp digits [ERROR]", () => {
            const sv = new StringValidator({
                regexp: /[0123]+/
            });
            const result = sv.validate("987a");
            expect(result.err).toEqual("invalid_format");
            expect(result.str).toEqual("987a");
            // expect(result.obj).toEqual(undefined);
        });

        // min & max & regexp

        it("should test regexp digits with <min2, max8>", () => {
            const sv = new StringValidator({
                regexp: /[0123]+/,
                min: 2,
                max: 8
            });
            const result = sv.validate("01331");
            expect(result.err).toEqual("");
            expect(result.str).toEqual("01331");
            expect(result.obj).toEqual("01331");
        });

        // it("should test regexp digits with <min2, max8> [ERROR]", () => {
        //     const sv = new StringValidator({
        //         regexp: /[0123]+/,
        //         min: 2,
        //         max: 8
        //     });
        //     const result = sv.validate("");
        //     expect(result.err).toEqual("invalid_format");
        // });

        // it("should test regexp digits with <min4, max7> [ERROR]", () => {
        //     const sv = new StringValidator({
        //         regexp: /[0123]+/,
        //         min: 4,
        //         max: 7
        //     });
        //     const result = sv.validate("8");
        //     expect(result.err).toEqual("invalid_format");
        // });

        // it("should test regexp digits with <min5, max9> [ERROR]", () => {
        //     const sv = new StringValidator({
        //         regexp: /[0123]+/,
        //         min: 5,
        //         max: 9
        //     });
        //     const result = sv.validate("888800001");
        //     expect(result.err).toEqual("");
        // });

        it("should test regexp digits with <min5, max9> [ERROR]", () => {
            const sv = new StringValidator({
                regexp: /[0123]+/,
                min: 5,
                max: 9
            });
            const result = sv.validate("8888000012");
            expect(result.err).toEqual("not_in_range");
            expect(result.str).toEqual("8888000012");
            expect(result.obj).toEqual("8888000012");
        });

    });

});
