import { IWorkitem } from "./Workitem";

interface IStageCollection {
    [index: number]: IStage
    map(...args: any[]): any
    filter(...args: any[]): any
}

// tslint:disable-next-line:max-classes-per-file
interface IStage {
    items: IWorkitem[]
    stage: string
}

export {
    IStageCollection,
    IStage,
}