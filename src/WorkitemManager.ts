import crypto from 'crypto';
import path from 'path';
import type { IStage, IStageCollection } from './Stage';
import { Success } from './Success';
import type { IWorkitem } from './Workitem';
import type { IHost } from './IHost';
import type { IGit } from './IGit';

export class WorkitemManager {
  public fs: IHost;
  public git: IGit;
  public config: any;
  public static gitroot = '';
  public static wiroot: string;
  constructor(git: IGit, fs: IHost) {
    this.git = git;
    this.fs = fs;

    // memoise strings
    WorkitemManager.gitroot =
      WorkitemManager.gitroot ||
      fs
        .execSync(`git rev-parse --show-toplevel`)
        .toString()
        .replace(/[\r\n]*/g, '');
    WorkitemManager.wiroot = path.join(
      WorkitemManager.gitroot,
      '/',
      '.workitem'
    );

    try {
      this.config = fs.readJsonSync(this.wipath('/workitem.json'));
    } catch (e) {
      this.config = undefined;
    }
  }
  wipath(resource: string): string {
    return path.join(WorkitemManager.wiroot, resource);
  }
  isInitialised(): any {
    return this.config != undefined;
  }
  public gitDo(func: () => void): void {
    this.fs.execSync(`git checkout -B __workitem__`);
    func();
    this.fs.execSync(`git checkout -`);
    this.fs.execSync(`git merge __workitem__`);
    this.fs.execSync(`git branch -D __workitem__`);
  }
  public filterWorkitems(
    where: (item: IWorkitem) => boolean = (x) => true
  ): IStageCollection {
    const dirs = this.config.directories;
    const tree = dirs.map((d: string) => {
      return {
        stage: d,
        items: this.fs
          .readdirSync(this.wipath(`/${d}`))
          .filter((f) =>
            this.fs.statSync(this.wipath(`/${d}/${f}`)).isDirectory()
          )
          .map((f) => {
            const res = this.fs.readJsonSync(
              this.wipath(`/${d}/${f}/index.json`)
            );
            res.id = f;
            return res;
          })
          .filter(where)
      };
    });
    return tree;
  }
  public get workitems(): IStageCollection {
    return this.filterWorkitems();
  }
  public add(def: any): string | any {
    const dir = (def.location || '+' + this.config.incoming).substring(1);
    delete def.location;
    if (!this.fs.existsSync(`${WorkitemManager.wiroot}/${dir}`)) {
      return null;
    }
    if (dir === '.secrets') {
      return null;
    }
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(def));
    hash.update(this.fs.execSync(`git rev-parse HEAD`).toString());
    const digest = hash.digest('hex').substring(0, 7);

    this.gitDo(() => {
      this.fs.writeJsonSync(
        `${WorkitemManager.wiroot}/${dir}/${digest}/index.json`,
        def
      );
      this.fs.execSync(
        `git add ${WorkitemManager.wiroot}/${dir}/${digest}/index.json`
      );
      this.fs.execSync(
        `git commit -m "[workitem:${digest}:add] ${def.description}"`
      );
    });
    return digest;
  }
  public show() {
    return this.workitems;
  }
  public idToWorkitem(item: string): Success<IWorkitem> {
    const itemids = /^(\d+\.\d+)|(#?[a-f0-9]{3,7})$/i.exec(item);
    if (itemids === null) {
      return new Success<IWorkitem>(
        false,
        `Didn't recognise workitem identity pattern "${item}"`
      );
    }
    const itemid = itemids[0].replace(/^#/, '');
    let workitem = null;
    if (itemid.indexOf('.') > 0) {
      const [istage, iitem] = itemid.split('.').map((x) => parseInt(x));
      workitem = this.workitems[istage].items[iitem];
    } else {
      const workitemlist = this.workitems
        .map((s: any) =>
          s.items.map((t: any) => Object.assign({ stage: s.stage }, t))
        )
        .reduce((a: any, b: any) => a.concat(b))
        .filter((x: any) =>
          itemid.length === 7 ? x.id === itemid : x.id.indexOf(itemid) === 0
        );
      if (workitemlist.length > 1) {
        return new Success<IWorkitem>(
          false,
          `Too many workitems matched the pattern "${item}"`
        );
      }
      if (workitemlist.length === 0) {
        return new Success<IWorkitem>(
          false,
          `No workitem was found for pattern "${item}"`
        );
      }
      workitem = workitemlist[0];
    }
    if (!workitem) {
      return new Success<IWorkitem>(
        false,
        `No workitem was found for pattern "${item}"`
      );
    } else {
      return new Success(true, workitem);
    }
  }
  public getComments(
    item: string
  ): Array<{ type: string; content: string; who: string }> {
    const workitem = this.idToWorkitem(item);
    if (!workitem.success) {
      throw workitem.error;
    }
    const dir = `${WorkitemManager.wiroot}/${this.workitemToStage(
      workitem.value.id
    )}/${workitem.value.id}`;
    const files = this.fs.readdirSync(dir);
    return files
      .map((f) => this.fs.readJsonSync(`${dir}/${f}`))
      .filter((f) => f.type === 'comment');
  }
  public move(item: string, stage: string, force = false) {
    const targetstage = this.workitems.filter((w: IStage) => w.stage === stage);
    if (targetstage.length === 0) {
      return { success: false, message: `No stage named ${stage}` };
    }
    const workitem = this.idToWorkitem(item);
    if (!workitem.success) {
      return workitem;
    }
    const currentStage = this.workitemToStage(workitem.value.id);
    if (currentStage === stage) {
      return new Success(
        false,
        `Cannot move a workitem from ${currentStage} to ${stage} because it's the same stage`
      );
    }
    if (!force && !this.isStageTransitionValid(currentStage, stage)) {
      return new Success(
        false,
        `Cannot move workitem from ${currentStage} to ${stage}. Use +force or move to a valid stage.`
      );
    }
    //console.log(`git mv "${WorkitemManager.wiroot}/${currentStage}/${workitem.value.id}" "${WorkitemManager.wiroot}/${stage}/${workitem.value.id}"`)
    this.gitDo(() => {
      this.fs.execSync(
        `git mv "${WorkitemManager.wiroot}/${currentStage}/${workitem.value.id}" "${WorkitemManager.wiroot}/${stage}/${workitem.value.id}"`
      );
      this.fs.execSync(
        `git commit -m "[workitem:${workitem.value.id}:move] ${currentStage} to ${stage}"`
      );
    });
    return workitem;
  }
  isStageTransitionValid(a: string, b: string): boolean {
    const transitions = this.config.transitions as [string, string][];
    return transitions.some(([from, to]) => from === a && to === b);
  }
  public rename(item: string, newname: string): Success<IWorkitem> {
    const workitem = this.idToWorkitem(item);
    if (!workitem.success) {
      return workitem;
    }
    workitem.value.description = newname;
    this.save(workitem.value);
    return new Success(true, workitem.value);
  }
  public comment(item: string, comment: string, who: string) {
    const workitem = this.idToWorkitem(item);
    if (!workitem.success) {
      return workitem;
    }
    this.appendItem(workitem.value, { type: 'comment', content: comment, who });
  }
  public tag(item: string, tag: string) {
    const workitem = this.idToWorkitem(item);
    if (!workitem.success) {
      return workitem;
    }
    if (!workitem.value.tags) {
      workitem.value.tags = [];
    }
    if (!workitem.value.tags.find((h) => h == tag)) {
      workitem.value.tags.push(tag);
      this.save(workitem.value);
    }
  }
  public save(workitem: IWorkitem) {
    this.gitDo(() => {
      const filename = `${WorkitemManager.wiroot}/${this.workitemToStage(
        workitem.id
      )}/${workitem.id}/index.json`;
      this.fs.writeJsonSync(filename, workitem);
      this.fs.execSync(`git add ${filename}`);
      this.fs.execSync(`git commit -m "[workitem:${workitem.id}:edit]"`);
    });
  }
  public previewcollate(progress: any, done: any) {
    progress({
      total: 100,
      current: 0
    });
    let branches = this.fs
      .execSync('git branch')
      .toString()
      .split(/\r\n|\r|\n/);
    let here = branches.find((b: string) => b.indexOf('*') === 0) || '';
    here = here.substring(2);
    branches = branches
      .filter((b: string) => b[0] === ' ')
      .map((b) => b.replace(/^ {2}/, ''));
    branches.forEach((branch, i) => {
      // add, del, ren: git diff --stat --diff-filter=ADR master..dcdcreadme .workitem
      // ^ we don't actually care about deletes in secondary branches
      // git checkout frombranch filetomove.ext

      // diff we don't know how to handle: git diff --stat --diff-filter=CMTUXB master..dcdcreadme .workitem
      /*
            added in secondary:  .workitem/doing/36ef7ea/index.json           | 1 +
            added in primary:    .workitem/doing/423a302/index.json           | 1 -
            relocated:           .workitem/{todo => doing}/4c4c9a7/index.json | 0
            */

      // tslint:disable-next-line:max-line-length
      this.fs
        .exec(
          `git diff --stat --name-only --diff-filter=A ${here}..${branch} ${WorkitemManager.wiroot}`
        )
        .then((result) => {
          const added = result.stdout;
          this.fs
            .exec(
              `git diff --stat --diff-filter=R ${here}..${branch} ${WorkitemManager.wiroot}`
            )
            .then((result) => {
              const renamed = result.stdout;
              let addedarr = [];
              let renamedarr = [];
              if (added)
                addedarr = added
                  .toString()
                  .split(/\r\n|\r|\n/)
                  .filter((x) => x);
              if (renamed)
                renamedarr =
                  renamed
                    .toString()
                    .match(/^.*\{.*\}[^|]*/gm)
                    ?.map((m) => m.substring(1).replace(/.$/, '')) || [];
              progress({
                total: branches.length - 1,
                current: i
              });
              if (branches.length - 1 === i) {
                done();
              }
            });
        });
      // console.log(chalk`{bgYellow !} found ${added.length} files in {bgBlue.white ${branch}} that ${added.length == 1 ? "is" : "are"} missing in {bgRed.white ${here}}`)
      // console.log(added)

      // console.log(chalk`{bgYellow !} found ${renamed.length} files in {bgBlue.white ${branch}} that ${renamed.length == 1 ? "is" : "are"} moved in {bgRed.white ${here}}`)
      // console.log(renamed)
    });
  }
  public workitemToStage(id: string): string {
    return this.workitems.find(
      (stage) => stage.items.find((item) => item.id === id) != null
    )!.stage;
  }
  public appendItem(
    workitem: IWorkitem,
    data: { type: string; content: any; who: string }
  ) {
    // generate identity
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    hash.update(this.fs.execSync(`git rev-parse HEAD`).toString());
    const digest = hash.digest('hex').substring(0, 7);
    const stamp = this.timestamp();
    const outfilename = `${stamp}.${digest}.${data.type}.json`;
    this.gitDo(() => {
      const stage = this.workitemToStage(workitem.id);
      const filename = `${WorkitemManager.wiroot}/${stage}/${workitem.id}/${outfilename}`;
      this.fs.writeJsonSync(filename, data);
      this.fs.execSync(`git add ${filename}`);
      this.fs.execSync(
        `git commit -m "[workitem:${workitem.id}:${data.type}]"`
      );
    });
  }
  public search(filter: (item: IWorkitem) => boolean): IStageCollection {
    return this.filterWorkitems(filter);
  }
  public timestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '');
  }
}
