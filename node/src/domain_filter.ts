import Command from './command'
import * as config from './certor_config'

export class DomainFilter implements Command {
  key : string = "domain-filter"

  private get(etcd: config.EtcdHelper, cb: (arr: string[])=>void) {
    etcd.get("domains.filter", (err, res: any) => {
      if (err) {
        console.error("No domain filters found")
        cb(null)
        return;
      }
      // console.log(">>>>>>", err, res)
      cb(JSON.parse(res['node']['value']))
    })
  }
  private set(etcd: config.EtcdHelper, arr: string[], cb: (arr: string[])=>void) {
    etcd.set("domains.filter", JSON.stringify(arr), (err,res) => {
      if (err) {
        console.error("domains.filter is not writable", err)
        cb(null)
        return
      }
      cb(arr)
    })
  }
  private modify(etcd: config.EtcdHelper,
      handler: (arr: string[]) => string[],
      cb:(err:string, res:any) => void) : void {
    this.get(etcd, (arr: string[]) => {
      arr = arr || []
      let post = handler(arr)
      if (post) {
        this.set(etcd, post, (arr: string[]) => {
          arr && arr.forEach((domain:string) => console.log(domain))
        })
      } else {
        arr.forEach((domain:string) => console.log(domain))
      }
      cb && cb(null, post || arr)
    })
  }

  public start(argv: string[], cb: (err:string, res:any)=>void) : void {
    let wc = config.Certor.create(argv)
    // console.log("start-0")
    wc.etcd((etcd) => {
      // console.log("start-1", argv)
      let add_ofs = argv.indexOf("add")
      if (add_ofs >= 0) {
        this.modify(etcd, (arr: string[]) => {
          if (!arr.find((l)=>l==argv[add_ofs+1])) {
            arr.push(argv[add_ofs+1])
            return arr;
          }
          return null;
        }, cb)
      }
      let del_ofs = argv.indexOf("del")
      if (del_ofs >= 0) {
         this.modify(etcd, (arr: string[]) => {
          let post = arr.filter((l) => l!=argv[del_ofs+1])
          if (post.length != arr.length) {
            return post;
          }
          return null;
        }, cb)
      }
      if (argv.indexOf("get") >= 0) {
        // console.log("start-2")
        this.get(etcd, (arr: string[]) => {
          // console.log("start-3", arr)
          arr && arr.forEach((domain:string) => console.log(domain))
          cb && cb(null, arr)
       })
      }
    })
  }
}

export default DomainFilter
