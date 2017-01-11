
import * as cmd from './command'
import IPAddress from 'ipaddress'
import Depots from './depots'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import StringListHandler from './string_list_handler'
import * as ipranges from './ipranges'
import * as listResult from './list_result'


export class DepotsIps implements cmd.Command {
  key: string = "depots-ips"
  public async start(argv: string[], etc : etcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd()
    let depot_id_ofs = argv.indexOf("--depot-id")
    let depot_id = argv[depot_id_ofs+1]
    if (depot_id_ofs < 0 || !depot_id || depot_id.length == 0) {
      return Promise.resolve(cmd.Error.text(`need add --depot-id:${depot_id}`))
    }
    let list_ofs = argv.indexOf("list")
    if (list_ofs >= 0) {
        let list = await etc.list(`depots/${depot_id}/ips`)
        if (list.isErr()) {
          return Promise.resolve(listResult.EtcdError(list))
        }
        let keys = list.value.map((l:any) => IPAddress.parse(l['key']))
        return Promise.resolve(listResult.ListResolve<IPAddress>(keys))
    }


    let ip_ofs = argv.indexOf("--ip")
    if (ip_ofs < 0) {
      return Promise.resolve(cmd.Error.text(`need add --ip:${argv[ip_ofs+1]}`))
    }
    let ip = IPAddress.parse(argv[ip_ofs+1])
    if (ip == null) {
      return Promise.resolve(cmd.Error.text(`need add --ip:${argv[ip_ofs+1]}`))
    }

    let add_ofs = argv.indexOf("add")
    if (add_ofs >= 0) {
      return DepotsIps.valid_creators_and_iprange(argv, etc, depot_id, ip, () => {
        try {
          let slh = new StringListHandler(`depots/${depot_id}/ips/${ip.to_s()}`)
          return slh.start(argv, etc)
        } catch (e) {
          return Promise.reject(e)
        }
      })
    }
    let del_ofs = argv.indexOf("del")
    if (del_ofs >= 0) {
      return DepotsIps.valid_creators_and_iprange(argv, etc, depot_id, ip, () => {
        try {
          let slh = new StringListHandler(`depots/${depot_id}/ips/${ip.to_s()}`)
          return slh.start(argv, etc)
        } catch (e) {
          return Promise.reject(e)
        }
      })

    }
  }

  public static async valid_creators_and_iprange(argv: string[], etc: etcd.Etcd, id: string, 
    ip: IPAddress, cb: ()=>Promise<any>) {
    return Depots.valid_creator(argv, etc, id, async (id: string) => {
        let iprs = await (new ipranges.IpRanges(`depots/${id}/ipranges`)).start(['get'], etc)
        if (iprs.isErr()) {
          return Promise.resolve()
        }
        if (ipranges.IpRanges.includes(ip, iprs.ok.asJson())) {
          return cb()
        }
        throw new Error(`ip not in range:${ip.to_s()}`)
    })
  }
}

export default DepotsIps
