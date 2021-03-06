import { expect } from "chai"
import "mocha"

import { Add } from "../commands/add"
import { Move } from "../commands/move"
import { FakeGit } from "../FakeGit";
import { FakeHost } from "../FakeHost";
import { Note } from "../commands/note";
import { Rename } from "../commands/rename";
import { Init } from "../commands/init";
import { Show } from "../commands/show";

const fs = new FakeHost()
const git = new FakeGit(fs)
const add = new Add(git, fs)

describe("add", () => {
    it("should accept add", () => {
        expect(add.parse("add")).to.eq(true)
    })
    it("should not accept empty", () => {
        expect(add.parse("")).to.eq(false)
    })    
    it("should accept add type string", () => {
        expect(add.parse("add type string")).to.deep.eq({
            description: "string",
            tags: null,
            type: "type",
            location: null,
            estimate: null,
            parent: null,
            child: null,
        })
    })
    it("should accept add string", () => {
        expect(add.parse("add string")).to.deep.eq({
            description: "string",
            tags: null,
            type: null,
            location: null,
            estimate: null,
            parent: null,
            child: null,
        })
    })
    it("should accept add \"string\"", () => {
        expect(add.parse("add \"foo\"")).to.deep.eq({
            description: "foo",
            tags: null,
            type: null,
            location: null,
            estimate: null,
            parent: null,
            child: null,
        })
    })
    it("should accept add type 'string'", () => {
        expect(add.parse("add type 'foo'")).to.deep.eq({
            description: "foo",
            tags: null,
            type: "type",
            location: null,
            estimate: null,
            child: null,
            parent: null,
        })
    })
    it("should accept add type 'string' #tag1 #tag2", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2")).to.deep.eq({
            description: "foo",
            tags: ["#tag1", "#tag2"],
            type: "type",
            location: null,
            estimate: null,
            child: null,
            parent: null,
        })
    })
    it("should accept add type 'string' #tag1 #tag2 @stage", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2 @stage")).to.deep.eq({
            description: "foo",
            tags: ["#tag1", "#tag2"],
            type: "type",
            location: "@stage",
            estimate: null,
            child: null,
            parent: null,
        })
    })
    it("should accept add type 'string' #tag1 #tag2 ~10", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2 ~10")).to.deep.eq({
            description: "foo",
            tags: ["#tag1", "#tag2"],
            type: "type",
            location: null,
            estimate: "~10",
            child: null,
            parent: null,
        })
    })
    it("should accept add type 'string' #tag1 #tag2 ~10 < theparent", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2 ~10 < theparent")).to.deep.eq({
            description: "foo",
            tags: ["#tag1", "#tag2"],
            type: "type",
            location: null,
            estimate: "~10",
            parent: "theparent",
            child: null,
        })
    })
})

describe("move", () => {
    it("should accept move 0.0 to stage", () => {
        expect(new Move(git, fs).parse("move 0.0 to stage")).to.deep.eq({
            item: "0.0",
            stage: "stage",
            force: false
        })
    })
    it("should accept move 999.999 to stage", () => {
        expect(new Move(git, fs).parse("move 999.999 to stage")).to.deep.eq({
            item: "999.999",
            stage: "stage",
            force: false
        })
    })
    it("should accept move 1234567 to stage", () => {
        expect(new Move(git, fs).parse("move 1234567 to stage")).to.deep.eq({
            item: "1234567",
            stage: "stage",
            force: false
        })
    })
    it("should accept move #1234567 to stage", () => {
        expect(new Move(git, fs).parse("move #1234567 to stage")).to.deep.eq({
            item: "#1234567",
            stage: "stage",
            force: false
        })
    })
})

describe("note", () => {
    it("should accept note 0.0 'this is a note'", () => {
        expect(new Note(git, fs).parse("note 0.0 'this is a note'")).to.deep.eq({
            item: "0.0",
            comment: "this is a note"
        })
    })
    it("should accept note #998877 'this is a note'", () => {
        expect(new Note(git, fs).parse("note #9988776 \"a 'quote' note\"")).to.deep.eq({
            item: "#9988776",
            comment: "a 'quote' note"
        })
    })
})

describe("rename", () => {
    it("should accept rename 0.0 'foobar'", () => {
        expect(new Rename(git, fs).parse("rename 0.0 'a new name'")).to.deep.eq({
            item: "0.0",
            newname: "a new name"
        })
    })
    it("should accept rename #123456F 'named'", () => {
        expect(new Rename(git, fs).parse("rename #123456F 'named'")).to.deep.eq({
            item: "#123456F",
            newname: "named"
        })
    })
})

describe("init", () => {
    it("should accept init", () => {
        expect(new Init(git, fs).parse("init")).to.deep.eq({
            init: true,
            auto: false,
            git: false,
            force: false
        })
    })
    it("should accept init auto", () => {
        expect(new Init(git, fs).parse("init auto")).to.deep.eq({
            init: true,
            auto: true,
            git: false,
            force: false
        })
    })
    it("should accept init auto +git", () => {
        expect(new Init(git, fs).parse("init auto +git")).to.deep.eq({
            init: true,
            auto: true,
            git: true,
            force: false
        })
    })
})


describe("show", () => {
    it("should accept show", () => {
        expect(new Show(git, fs).parse("show")).to.deep.eq({
            show: true,
            more: false,
            item: null,
            stage: null
        })
    })
    it("should accept more", () => {
        expect(new Show(git, fs).parse("more")).to.deep.eq({
            show: true,
            more: true,
            item: null,
            stage: null
        })
    })
    it("should accept show more", () => {
        expect(new Show(git, fs).parse("show more")).to.deep.eq({
            show: true,
            more: true,
            item: null,
            stage: null
        })
    })
    it("should accept @todo", () => {
        expect(new Show(git, fs).parse("@todo")).to.deep.eq({
            show: true,
            more: false,
            item: null,
            stage: "todo"
        })
    })
})