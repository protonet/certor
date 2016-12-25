import Command from './command'
import * as config from './certor_config'

import * as request from 'request-promise'

import Etcd from './etcd'

export class StringListHandler implements Command {
  key: string
  constructor(key: string) {
    this.key = key;
  }
  private async get(etcd: Etcd) {
    try {
      let ret = await etcd.get(this.key)
      if (ret['node']) {
        // console.log(">>>>>NODE:", ret['node'])
        return Promise.resolve(JSON.parse(ret['node']['value']))
      } else {
        // console.log(">>>>>EMPTY:", ret['node'])
        return Promise.resolve([])
      }
    } catch (e) {
      return Promise.reject(e) 
    }
  }
  private async set(etcd: Etcd, arr: string[]) : Promise<string[]> {
    try {
      await etcd.set(this.key, JSON.stringify(arr));
      return Promise.resolve(arr)
    } catch (err) {
      return Promise.resolve(null)
    }
  }
  private async modify(etcd: Etcd, handler: (arr: string[])=>string[]) : Promise<string[]> {
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
      let arr = await this.modify(etcd, (arr: string[]) => {
        if (!arr.find((l)=>l==argv[add_ofs+1])) {
          arr.push(argv[add_ofs+1])
          // console.log("ADD:", argv[add_ofs+1], arr)
          return arr;
        }
        // console.log("ADD NULL", arr, argv[add_ofs+1])
        return null;
      })
      arr && arr.forEach((domain:any) => console.log(domain))
      return Promise.resolve(arr)
    }
    let del_ofs = argv.indexOf("del")
    if (del_ofs >= 0) {
        let arr = await this.modify(etcd, (arr: string[]) => {
          let post = arr.filter((l) => l!=argv[del_ofs+1])
          if (post.length != arr.length) {
            return post;
          }
          return null;
      })
      arr && arr.forEach((domain:any) => console.log(domain))
      return Promise.resolve(arr)
    }
    if (argv.indexOf("get") >= 0) {
    // console.log("start-2")
      let arr = await this.get(etcd)
      arr && arr.forEach((domain:any) => console.log(domain))
      return Promise.resolve(arr)
    }
    return null
  }
}

export default StringListHandler
