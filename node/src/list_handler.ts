import * as cmd from './command'
import * as config from './certor_config'

import * as request from 'request-promise'

import * as petcd from 'promise-etcd'

import * as listResult from './list_result'

export interface Actor<T> {
  adder(key: string) : (arr: string[]) => T[];
  deler(key: string) : (arr: string[]) => T[];
  geter(arr: string[]) : T[];
  toString(t: T) : string;
}


export class ListHandler<T> implements cmd.Command {
  key: string
  actor: Actor<T>
  constructor(key: string, actor: Actor<T>) {
    this.key = key;
    this.actor = actor
  }

  private async get(etcd: petcd.Etcd) {
    let ret = await etcd.getJson(this.key)
    if (ret.isErr()) {
      if (ret.err.err.statusErr.statusCode == 404) {
        return Promise.resolve(petcd.EtcValue.value<T[]>([]))
      }
    }
    return ret;
  }

  private async set(etcd: petcd.Etcd, arr: T[]) : Promise<petcd.EtcValue<T[]>> {
    let ret = await etcd.setJson(this.key, arr);
    if (ret.isErr()) {
      // console.log("SET ERR", this.key, arr, ret.isErr())
      return Promise.resolve(petcd.EtcValue.error<T[]>(ret))
    }
    // console.log("SET OK", this.key, arr, ret.isErr())
    return Promise.resolve(petcd.EtcValue.value<T[]>(arr))
  }

  private async modify(etcd: petcd.Etcd, handler: (arr: string[])=>T[]) : Promise<petcd.EtcValue<T[]>> {
    let arr = await this.get(etcd)
    if (arr.isErr()) {
      return Promise.resolve(petcd.EtcValue.error<T[]>(arr))
    }
    // console.log("MODIFY:", arr)
    arr.value = arr.value || []
    let post = handler(arr.value)
    if (post) {
       //console.log("POST", post)
      //  console.log("PRE-MOD", this.key, arr)
       let ret = await this.set(etcd, post) 
       if (ret.isErr()) {
          // console.log("ERR MOD", this.key, arr, ret.err)
         return Promise.resolve(petcd.EtcValue.error<T[]>(ret))
       }
    }
    //console.log(arr, post)
    return Promise.resolve(petcd.EtcValue.value(post || arr.value))
  }

  public async start(argv: string[], etcd: petcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etcd = etcd || await wc.etcd();
    // console.log(etcd);
    // // console.log("start-0")
    // wc.etcd((etcd) => {
    //   // console.log("start-1", argv)
    let add_ofs = argv.indexOf("add")
    if (add_ofs >= 0) {
      let arr = await this.modify(etcd, this.actor.adder(argv[add_ofs+1]))
      // console.log("ADD", arr, argv[add_ofs+1])
      if (arr.isErr()) {
        return Promise.resolve(listResult.EtcdListError<T>(arr))
      }
      // arr.value.forEach((domain:any) => console.log(this.actor.toString(domain)))
      return Promise.resolve(listResult.EtcdListResult<T>(arr))
    }
    let del_ofs = argv.indexOf("del")
    if (del_ofs >= 0) {
      let arr = await this.modify(etcd, this.actor.deler(argv[del_ofs+1]))
      if (arr.isErr()) {
        return Promise.resolve(listResult.EtcdListError<T>(arr))
      }
      // arr.value.forEach((domain:any) => console.log(this.actor.toString(domain)))
      return Promise.resolve(listResult.EtcdListResult<T>(arr))
    }
    if (argv.indexOf("get") >= 0) {
      let ret = await this.get(etcd)
      if (ret.isErr()) {
        return Promise.resolve(listResult.EtcdError(ret))
      }
      return Promise.resolve(listResult.EtcdListResult(ret))
    }
    debugger
    return null
  }
}

export default ListHandler
