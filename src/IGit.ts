import { IHost } from './IHost';

export interface IGit {
  fs: IHost;
  getCurrentBranch(): Promise<string>;

  getEmail(): Promise<string>;
  getUsername(): Promise<string>;
  getWho(): Promise<string>;
  setEmail(email: string): Promise<boolean>;
  setUsername(username: string): Promise<boolean>;

  isRepo(): Promise<boolean>;
  isInit(): Promise<boolean>;

  init(): Promise<boolean>;
  add(pattern: string): Promise<boolean>;
  commit(message: string): Promise<boolean>;
}
