
import Command from './command'
import * as etcd from './etcd'
import * as config from './certor_config'
import StringListHandler from './string_list_handler'
import * as path from 'path'

export class Depots implements Command {
  key: string = "depots"

  public async start(argv: string[], etc: etcd.Etcd = null) : Promise<any> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();
    // let create_ofs = argv.indexOf("create")
    // if (create_ofs >= 0) {
    // //   let id = argv[create_ofs+1] 
    // //   let ip = IPAddress.parse(argv[create_ofs+2]) 
    // //   let slh = ...
    // }
    let delete_ofs = argv.indexOf("delete")
    if (delete_ofs >= 0) {
      let id = argv[delete_ofs+1] 
      let ret = await etc.list("depots")
      if (ret['node']) { 
        let notRemoved = []
        for (let node of ret['node']['nodes']) {
          let pkey = path.basename(node['key'])
          if (pkey == id) {
            console.log("removing:", id, ":", node['key'])
            await etc.delete(`depots/${id}?dir=true&recursive=true`)
          } else {
            notRemoved.push(pkey)
          }
        }
        return Promise.resolve(notRemoved)
      }
    }
    let last_active_ofs = argv.indexOf("last_active")
    if (last_active_ofs >= 0) {
      let id = argv[last_active_ofs+1] 
      if (!id || id.length <= 0) {
        console.error("last_active need's an id")
        return Promise.reject("need an id")
      }
      // console.log("last_active:", id);
      if (argv[last_active_ofs+2] == "update") {
      //  console.log("last_active:update", id);
       try {
         let date_ofs = argv.indexOf("--date")
         let now
         if (date_ofs >= 0) {
           now = new Date(argv[date_ofs+1])
         } else {
           now = new Date()
         }
         console.log("last_active:update", id, now);
         let ret = await etc.set(`depots/${id}/last_active`, now.toISOString())
        //  console.log("UPDATE:", ret)
         return Promise.resolve(now)
       } catch(e) {
          return Promise.reject("set failed:"+e)
       }
      }
      if (argv[last_active_ofs+2] == "get") {
       console.log("last_active:get", id);
        try {
          let ret = await etc.get(`depots/${id}/last_active`)
          // console.log("GET :",ret)
          if (ret['node']) {
            return Promise.resolve(new Date(ret['node']['value']))
          } else {
            return Promise.resolve(null)
          }
        } catch(e) {
          return Promise.reject("get failed:"+e)
        }
      }
    }
    let list_ofs = argv.indexOf("list")
    if (list_ofs >= 0) {
      try {
        let ret = await etc.list("depots")
        if (ret['node']) {
          let keys = []
          for (let node of ret['node']['nodes']) {
            let key = path.basename(node['key'])
            keys.push(key)
            console.log(key)
          }
          return Promise.resolve(keys)
        } else {
          return Promise.resolve([])
        }
      } catch (e) {
        console.error("list failed")
        return Promise.reject("list failed")
      }
    }
    let iprange_ofs = argv.indexOf("iprange")
     if (iprange_ofs >= 0) {
      let id = argv[iprange_ofs + 1]
      if (!id || id.length <= 0) {
        console.error("iprange need's an id")
        return Promise.reject("need an id")
      }
      let slh = new StringListHandler(`depots/${id}/ipranges`)
      return slh.start(argv, etc)
    }
    return null;
  }
}

export default Depots
