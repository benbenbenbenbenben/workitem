import { IGit } from './IGit';
import { IHost } from './IHost';

export class FakeGit implements IGit {
  setEmail(email: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  setUsername(username: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  init(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  add(pattern: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  commit(message: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  fs: IHost;
  constructor(fs: IHost) {
    this.fs = fs;
  }
  getCurrentBranch(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getUsername(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getEmail(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getWho(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  isRepo(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  isInit(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  createRepo(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
