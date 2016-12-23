import Command from './command'
import * as config from './certor_config'

class DomainFilter implements Command {
  key : string = "domain-filter"

  private get(etcd: config.EtcdHelper, cb: (arr: string[])=>void) {
    etcd.get("domains.filter", (err, res: any) => {
      if (err) {
        console.error("No domain filters found")
        cb(null)
        return;
      }
      // console.log(err, res)
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
  private modify(etcd: config.EtcdHelper, handler: (arr: string[]) => string[]) : void {
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
    })
  }

  public start(argv: string[], cb: (err:string, res:string)=>void) : void {
    let wc = config.Certor.create(argv)
    wc.etcd((etcd) => {
      let ofs = argv.indexOf("add")
      if (ofs > 0) {
        this.modify(etcd, (arr: string[]) => {
          if (!arr.find((l)=>l==argv[ofs+1])) {
            arr.push(argv[ofs+1])
            return arr;
          }
          return null;
        })
      }
      ofs = argv.indexOf("del")
      if (ofs > 0) {
         this.modify(etcd, (arr: string[]) => {
          let post = arr.filter((l) => l!=argv[ofs+1])
          if (post.length != arr.length) {
            return post;
          }
          return null;
         })
      }
      if (argv.indexOf("get") > 0) {
        this.get(etcd, (arr: string[]) => { 
          arr && arr.forEach((domain:string) => console.log(domain))
       }) 
      }
    })
  }
}

export default DomainFilter
