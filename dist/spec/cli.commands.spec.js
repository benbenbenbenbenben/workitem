"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const add_1 = require("../commands/add");
const move_1 = require("../commands/move");
const FakeGit_1 = require("../FakeGit");
const FakeHost_1 = require("../FakeHost");
const note_1 = require("../commands/note");
const rename_1 = require("../commands/rename");
const init_1 = require("../commands/init");
const show_1 = require("../commands/show");
const fs = new FakeHost_1.FakeHost();
const git = new FakeGit_1.FakeGit(fs);
const add = new add_1.Add(git, fs);
describe('add', () => {
    it('should accept add', () => {
        expect(add.parse('add')).toBe(true);
    });
    it('should not accept empty', () => {
        expect(add.parse('')).toBe(false);
    });
    it('should accept add type string', () => {
        expect(add.parse('add type string')).toStrictEqual({
            description: 'string',
            tags: null,
            type: 'type',
            location: null,
            estimate: null,
            parent: null,
            child: null
        });
    });
    it('should accept add string', () => {
        expect(add.parse('add string')).toStrictEqual({
            description: 'string',
            tags: null,
            type: null,
            location: null,
            estimate: null,
            parent: null,
            child: null
        });
    });
    it('should accept add "string"', () => {
        expect(add.parse('add "foo"')).toStrictEqual({
            description: 'foo',
            tags: null,
            type: null,
            location: null,
            estimate: null,
            parent: null,
            child: null
        });
    });
    it("should accept add type 'string'", () => {
        expect(add.parse("add type 'foo'")).toStrictEqual({
            description: 'foo',
            tags: null,
            type: 'type',
            location: null,
            estimate: null,
            child: null,
            parent: null
        });
    });
    it("should accept add type 'string' #tag1 #tag2", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2")).toStrictEqual({
            description: 'foo',
            tags: ['#tag1', '#tag2'],
            type: 'type',
            location: null,
            estimate: null,
            child: null,
            parent: null
        });
    });
    it("should accept add type 'string' #tag1 #tag2 @stage", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2 @stage")).toStrictEqual({
            description: 'foo',
            tags: ['#tag1', '#tag2'],
            type: 'type',
            location: '@stage',
            estimate: null,
            child: null,
            parent: null
        });
    });
    it("should accept add type 'string' #tag1 #tag2 ~10", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2 ~10")).toStrictEqual({
            description: 'foo',
            tags: ['#tag1', '#tag2'],
            type: 'type',
            location: null,
            estimate: '~10',
            child: null,
            parent: null
        });
    });
    it("should accept add type 'string' #tag1 #tag2 ~10 < parent", () => {
        expect(add.parse("add type 'foo' #tag1 #tag2 ~10 < parent")).toStrictEqual({
            description: 'foo',
            tags: ['#tag1', '#tag2'],
            type: 'type',
            location: null,
            estimate: '~10',
            parent: 'parent',
            child: null
        });
    });
});
describe('move', () => {
    it('should accept move 0.0 to stage', () => {
        expect(new move_1.Move(git, fs).parse('move 0.0 to stage')).toStrictEqual({
            item: '0.0',
            stage: 'stage',
            force: false
        });
    });
    it('should accept move 999.999 to stage', () => {
        expect(new move_1.Move(git, fs).parse('move 999.999 to stage')).toStrictEqual({
            item: '999.999',
            stage: 'stage',
            force: false
        });
    });
    it('should accept move 1234567 to stage', () => {
        expect(new move_1.Move(git, fs).parse('move 1234567 to stage')).toStrictEqual({
            item: '1234567',
            stage: 'stage',
            force: false
        });
    });
    it('should accept move #1234567 to stage', () => {
        expect(new move_1.Move(git, fs).parse('move #1234567 to stage')).toStrictEqual({
            item: '#1234567',
            stage: 'stage',
            force: false
        });
    });
});
describe('note', () => {
    it("should accept note 0.0 'this is a note'", () => {
        expect(new note_1.Note(git, fs).parse("note 0.0 'this is a note'")).toStrictEqual({
            item: '0.0',
            comment: 'this is a note'
        });
    });
    it("should accept note #998877 'this is a note'", () => {
        expect(new note_1.Note(git, fs).parse('note #9988776 "a \'quote\' note"')).toStrictEqual({
            item: '#9988776',
            comment: "a 'quote' note"
        });
    });
});
describe('rename', () => {
    it("should accept rename 0.0 'foobar'", () => {
        expect(new rename_1.Rename(git, fs).parse("rename 0.0 'a new name'")).toStrictEqual({
            item: '0.0',
            newname: 'a new name'
        });
    });
    it("should accept rename #123456F 'named'", () => {
        expect(new rename_1.Rename(git, fs).parse("rename #123456F 'named'")).toStrictEqual({
            item: '#123456F',
            newname: 'named'
        });
    });
});
describe('init', () => {
    it('should accept init', () => {
        expect(new init_1.Init(git, fs).parse('init')).toStrictEqual({
            init: true,
            auto: false,
            git: false,
            force: false
        });
    });
    it('should accept init auto', () => {
        expect(new init_1.Init(git, fs).parse('init auto')).toStrictEqual({
            init: true,
            auto: true,
            git: false,
            force: false
        });
    });
    it('should accept init auto +git', () => {
        expect(new init_1.Init(git, fs).parse('init auto +git')).toStrictEqual({
            init: true,
            auto: true,
            git: true,
            force: false
        });
    });
});
describe('show', () => {
    it('should accept show', () => {
        expect(new show_1.Show(git, fs).parse('show')).toStrictEqual({
            show: true,
            more: false,
            item: null,
            stage: null
        });
    });
    it('should accept more', () => {
        expect(new show_1.Show(git, fs).parse('more')).toStrictEqual({
            show: true,
            more: true,
            item: null,
            stage: null
        });
    });
    it('should accept show more', () => {
        expect(new show_1.Show(git, fs).parse('show more')).toStrictEqual({
            show: true,
            more: true,
            item: null,
            stage: null
        });
    });
    it('should accept @todo', () => {
        expect(new show_1.Show(git, fs).parse('@todo')).toStrictEqual({
            show: true,
            more: false,
            item: null,
            stage: 'todo'
        });
    });
});
