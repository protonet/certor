
import Command from './command'
import * as etcd from './etcd'
import * as config from './certor_config'
import StringListHandler from './string_list_handler'
import * as path from 'path'

export class DepotsIdIpRanges implements Command {
  key: string = "depots-id-ipranges"

  public async start(argv: string[], etcd: etcd.Etcd = null) : Promise<any> {
    let wc = config.Certor.create(argv)
    etcd = etcd || await wc.etcd();
    let list_ofs = argv.indexOf("list")
    if (list_ofs >= 0) {
      try {
        let ret = await etcd.list("/depots")
        console.log(">>>>>>", ret)
        if (ret['node']) {
          for (let node of ret['node']['nodes']) {
            if (node['key'].endsWith(".ipranges")) {
              console.log(path.basename(node['key']))
            }
          }
          return Promise.resolve(ret['node']['nodes'].map((n:any)=>path.basename(n['key'])))
        } else {
          return Promise.resolve([])
        }
      } catch (e) {
        console.error("list failed")
        return Promise.reject("list failed")
      }
    }
    let id = argv.indexOf("--depot-id")
    if (id >= 0) {
      let slh = new StringListHandler(`depots/${argv[id+1]}.ipranges`)
      return slh.start(argv, etcd)
    }
    return null;
  }
}

export default DepotsIdIpRanges
