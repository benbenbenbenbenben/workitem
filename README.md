# <span style="background-color: #FF0000; color:#efefef">&nbsp;.workitem&nbsp;</span> : the distributed work item tracker

workitem is a command line tool that puts work items where they belong, with our work! 

You can call it with `workitem` or `wi` and you can log new issues as quickly as you can say, well, exactly what the issue is!

`$ workitem add "debounce 'add again' button on main cart view" #bug ~1`

And that's it. A new issue. With the tag `#bug` and an estimated complexity of `~1`.

One line descriptions aren't enough? Run `workitem new` for the editor:



To get started, run `npm i -g workitem`, then in your git repo run `workitem init`

## Getting Started

#### To **add** an item do:

_Example:_

`wi add "fix terrible bug"`

You can optionally include as many `#tags` as you wish and specify a `~complexity` in whatever estimation language you prefer e.g. story points `~10` or t-shirt sizes `~medium` or weight in carrots `~20kg`. workitem is unit of effort agnostic in the same way that you project manager is supposed to be.

If your work item is dependent on another item, you can specify that dependency with the `<` and `>` characters.

`<` for example marks a work item as a child of, or smaller than, another. Adding a child item as follows, `wi add "a task that can't be completed yet" < ` _`f00b005`_, would prevent task `f00b005` being moved beyond the active stage of your newly created task in the work flow.

#### To move an item with an _`id-or-index`_ do:

_Example:_

`wi move ` _`id-or-index`_ ` [to] doing [-f]`

Moving an item must be forced with `-f` if you are moving from and to workflow stages that are not specified as transitionable or permitted by parent-child relationships (see [config](#config) to learn about workflow transitions)

#### To show items do:

_Example:_

`wi`

_Outputs:_

![wi](docs/wi.png)

Shows the current work item "board" truncated enough that it fits without much scrolling around.

_Example:_

`wi show more`

_Outputs:_

![wi](docs/wimore.png)

Shows all the work items that are in your current iteration, and if you don't work in iterations, all those that are not archived.

#### To note something on an item do:

`wi note` _`id-or-index`_ `"interesting findings Alice!"`