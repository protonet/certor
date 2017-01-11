
import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import StringListHandler from './string_list_handler'
import DepotsCreators from './depots_creators'
import * as path from 'path'
import * as ipranges from './ipranges'
import listAction from './list_action'
import * as listResult from './list_result'

export class Depots implements cmd.Command {
  key: string = "depots"

  private async delete(etc : etcd.Etcd, id: string) : Promise<etcd.EtcValue<string[]>> {
     let list = await etc.list("depots")
     if (list.isErr()) {
        return Promise.resolve(etcd.EtcValue.error<string[]>(list)) 
     }
     let notRemoved : string[]  = []
     list.value.forEach(async (node) => {
       let pkey = path.basename(node.key)
       if (pkey == id) {
          console.log("removing:", id, ":", node['key'])
          let del = await etc.delete(`depots/${id}?dir=true&recursive=true`)
          if (del.isErr()) {
            return Promise.resolve(etcd.EtcValue.error<string[]>(del)) 
          } 
       } else {
          notRemoved.push(pkey)
       }
     })
     return Promise.resolve(etcd.EtcValue.value(notRemoved))
  }

  private async last_active_update(argv: string[], etc : etcd.Etcd, id: string) {
      //  console.log("last_active:update", id);
    let date_ofs = argv.indexOf("--date")
    let now
    if (date_ofs >= 0) {
      now = new Date(argv[date_ofs+1])
    } else {
      now = new Date()
    }
    //  console.log("last_active:update", id, now);
    let ret = await etc.setRaw(`depots/${id}/last_active`, now.toISOString())
    if (ret.isErr()) {
      return Promise.resolve(etcd.EtcValue.error(ret))
    }
    //  console.log("UPDATE:", ret)
    return Promise.resolve(etcd.EtcValue.value(now))
  }
  private async last_active_get(etc : etcd.Etcd, id: string) {
    // console.log("last_active:get", id);
    let ret = await etc.getString(`depots/${id}/last_active`)
    if (ret.isErr()) {
      return Promise.resolve(etcd.EtcValue.error(ret))
    }
    return Promise.resolve(etcd.EtcValue.value(new Date(ret.value)))
  }

  public async start(argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();
  
    let delete_ofs = argv.indexOf("delete")
    if (delete_ofs >= 0) {
      let id = argv[delete_ofs+1] 
      return Depots.valid_creator(argv, etc, id, async (id) => {
        return listResult.Resolve(await this.delete(etc, id))
       })
    }
    let last_active_ofs = argv.indexOf("last_active")
    if (last_active_ofs >= 0) {
      let id = argv[last_active_ofs+1] 
      if (!id || id.length <= 0) {
        return Promise.resolve(cmd.Error.text("last_active need's an id"))
      }
      if (argv[last_active_ofs+2] == "update") {
        return Depots.valid_creator(argv, etc, id, async (id) => {
          return listResult.Resolve(await this.last_active_update(argv, etc, id))
        })
      }
      if (argv[last_active_ofs+2] == "get") {
        return listResult.Resolve(await this.last_active_get(etc, id))
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
        return Promise.resolve(cmd.Error.text("need an id"))
      }
      return Depots.valid_creator(argv, etc, id, (id:string) => {
        let slh = new ipranges.IpRanges(`depots/${id}/ipranges`)
        return slh.start(argv, etc)
      })
    }
    return Promise.resolve(cmd.Error.text("unhandeled"))
  }

  public static async valid_creator(argv: string[], etc: etcd.Etcd, id: string, cb: (id:string)=>Promise<cmd.Result>) {
    let creator_ofs = argv.indexOf("--creator")
    let creator = argv[creator_ofs+1]
    if (creator_ofs >= 0 && creator && creator.length > 0) {
      let creators = await (new DepotsCreators()).start(['get'], etc)
      if (creators.ok.asJson().find((c:string)=>c==creator)) {
        return cb(id)
      }
    } 
    return Promise.resolve(cmd.Error.text(`no --creator:${creator}`))
  }
}

export default Depots
