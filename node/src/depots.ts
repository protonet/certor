
import Command from './command'
import * as etcd from './etcd'
import * as config from './certor_config'
import StringListHandler from './string_list_handler'
import DepotsCreators from './depots_creators'
import * as path from 'path'
import * as ipranges from './ipranges'
import listAction from './list_action'

export class Depots implements Command {
  key: string = "depots"

  private async delete(etc : etcd.Etcd, id: string) {
    try {
     let list = await etc.list("depots")
     let notRemoved = []
     for (let node of list) {
       let pkey = path.basename(node['key'])
       if (pkey == id) {
          console.log("removing:", id, ":", node['key'])
          await etc.delete(`depots/${id}?dir=true&recursive=true`)
       } else {
          notRemoved.push(pkey)
       }
      }
      return Promise.resolve(notRemoved)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  private async last_active_update(argv: string[], etc : etcd.Etcd, id: string) {
      //  console.log("last_active:update", id);
    try {
      let date_ofs = argv.indexOf("--date")
      let now
      if (date_ofs >= 0) {
        now = new Date(argv[date_ofs+1])
      } else {
        now = new Date()
      }
    //  console.log("last_active:update", id, now);
      let ret = await etc.setRaw(`depots/${id}/last_active`, now.toISOString())
    //  console.log("UPDATE:", ret)
      return Promise.resolve(now)
    } catch(e) {
      return Promise.reject("set failed:"+e)
    }
  }
  private async last_active_get(etc : etcd.Etcd, id: string) {
    console.log("last_active:get", id);
    try {
      let ret = await etc.getString(`depots/${id}/last_active`)
    } catch(e) {
      if (e.statusCode == 404) {
        return Promise.resolve(null)
      }
      return Promise.reject("get failed:"+e)
    }
  }

  public async start(argv: string[], etc: etcd.Etcd = null) : Promise<any> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();
  
    let delete_ofs = argv.indexOf("delete")
    if (delete_ofs >= 0) {
      let id = argv[delete_ofs+1] 
      return Depots.valid_creator(argv, etc, id, (id) => {
        return this.delete(etc, id)
      })
    }
    let last_active_ofs = argv.indexOf("last_active")
    if (last_active_ofs >= 0) {
      let id = argv[last_active_ofs+1] 
      if (!id || id.length <= 0) {
        console.error("last_active need's an id")
        return Promise.reject("need an id")
      }
      if (argv[last_active_ofs+2] == "update") {
        return Depots.valid_creator(argv, etc, id, (id) => {
          return this.last_active_update(argv, etc, id)
        })
      }
      if (argv[last_active_ofs+2] == "get") {
        return this.last_active_get(etc, id)
      }
    }
    let list_ofs = argv.indexOf("list")
    if (list_ofs >= 0) {
      return listAction("depots", etc)
    }
    let iprange_ofs = argv.indexOf("iprange")
    if (iprange_ofs >= 0) {
      let id = argv[iprange_ofs + 1]
      if (!id || id.length <= 0) {
        console.error("iprange need's an id")
        return Promise.reject("need an id")
      }
      return Depots.valid_creator(argv, etc, id, (id:string) => {
        let slh = new ipranges.IpRanges(`depots/${id}/ipranges`)
        return slh.start(argv, etc)
      })
    }
    return Promise.reject("unknown")
  }

  public static async valid_creator(argv: string[], etc: etcd.Etcd, id: string, cb: (id:string)=>Promise<any>) {
    try {
      let creator_ofs = argv.indexOf("--creator")
      let creator = argv[creator_ofs+1]
      if (creator_ofs >= 0 && creator && creator.length > 0) {
        let creators = await (new DepotsCreators()).start(['get'], etc)
        if (creators.find((c:string)=>c==creator)) {
          return cb(id)
        }
      } 
      throw new Error(`no --creator:${creator}`)
    } catch(e) {
      return Promise.reject(e)
    }
  }
}

export default Depots
