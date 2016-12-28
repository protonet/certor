import Command from './command'
import * as config from './certor_config'

import * as request from 'request-promise'

import Etcd from './etcd'

export interface Actor<T> {
  adder(key: string) : (arr: string[]) => T[];
  deler(key: string) : (arr: string[]) => T[];
  geter(arr: string[]) : T[];
  toString(t: T) : string;
}

export class ListHandler<T> implements Command {
  key: string
  actor: Actor<T>
  constructor(key: string, actor: Actor<T>) {
    this.key = key;
    this.actor = actor
  }
  private async get(etcd: Etcd) {
    try {
      let ret = await etcd.getJson(this.key)
      return ret
    } catch (err) {
      if (err.statusCode == 404) {
          return Promise.resolve([])
      }
      return Promise.reject(err) 
    }
  }
  private async set(etcd: Etcd, arr: T[]) : Promise<T[]> {
    try {
      await etcd.setJson(this.key, arr);
      return Promise.resolve(arr)
    } catch (err) {
      return Promise.resolve(null)
    }
  }
  private async modify(etcd: Etcd, handler: (arr: string[])=>T[]) : Promise<T[]> {
    let arr = await this.get(etcd)
    // console.log("MODIFY:", arr)
    arr = arr || []
    let post = handler(arr)
    if (post) {
      post = await this.set(etcd, post) 
    }
    return Promise.resolve(post || arr)
  }

  public async start(argv: string[], etcd: Etcd = null) {
    let wc = config.Certor.create(argv)
    etcd = etcd || await wc.etcd();
    // console.log(etcd);
    // // console.log("start-0")
    // wc.etcd((etcd) => {
    //   // console.log("start-1", argv)
    let add_ofs = argv.indexOf("add")
    if (add_ofs >= 0) {
      let arr = await this.modify(etcd, this.actor.adder(argv[add_ofs+1]))
      arr && arr.forEach((domain:any) => console.log(this.actor.toString(domain)))
      return Promise.resolve(arr)
    }
    let del_ofs = argv.indexOf("del")
    if (del_ofs >= 0) {
        let arr = await this.modify(etcd, this.actor.deler(argv[del_ofs+1]))
      arr && arr.forEach((domain:any) => console.log(this.actor.toString(domain)))
      return Promise.resolve(arr)
    }
    if (argv.indexOf("get") >= 0) {
    // console.log("start-2")
      let arr = this.actor.geter(await this.get(etcd))
      arr && arr.forEach((domain:T) => console.log(this.actor.toString(domain)))
      return Promise.resolve(arr)
    }
    return null
  }
}

export default ListHandler
