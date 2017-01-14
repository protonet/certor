

import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import * as utils from './utils'
import * as sshpk from 'sshpk'
import * as path from 'path'

import * as listResult from './list_result'

export class DepotsCreators implements cmd.Command {
  key: string = "depots.creators"

  private async list(etc: etcd.Etcd) : Promise<cmd.Result> {
    let creators = await etc.list(`depots.creators`)
    if (creators.isErr()) {
      if (creators.err.err.statusErr.statusCode == 404) {
        return Promise.resolve(listResult.ListResolve([]))
      }
      return Promise.resolve(utils.errValue(creators.err))
    }
    return Promise.resolve(utils.okValue(creators.value.map((i) => path.basename(i.key))))
  }

  private getFnameFromKey(key: sshpk.Certificate) : string {
    let fpr = key.fingerprint("sha256").toString("hex").split(":").join("")
    let cn = key.subjects[0].cn.replace(/[^a-zA-Z0-9\-\.]/g, "")
    // console.log(">>>", fpr, cn, key.subjects[0].cn)
    return `${fpr}.${cn}`
  }

  public async start(argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();

    let delete_ofs = argv.indexOf("del")
    if (delete_ofs >= 0) {
      let pem = await utils.parseValue(argv[delete_ofs+1])
      if (pem.isErr()) {
        return pem
      }
      let fname = null
      try {
        let key = sshpk.parseCertificate(pem.ok.asJson(), "pem")
        fname = this.getFnameFromKey(key)
      } catch (e) {
        fname = pem.ok.asJson()
      }
      let ret = await etc.delete(`depots.creators/${fname}`)
      if (ret.isErr()) {
        return Promise.resolve(utils.errValue(ret.err))
      }
      return this.list(etc)
    }
    let add_ofs = argv.indexOf("add")
    if (add_ofs >= 0) {
      let pem = await utils.parseValue(argv[add_ofs+1])
      if (pem.isErr()) {
        return pem
      }
      let key = null
      try {
        key = sshpk.parseCertificate(pem.ok.asJson(), "pem")
      } catch (e) {
        return Promise.resolve(utils.errValue("can't read pem"))
      }
      let ret = await etc.setRaw(`depots.creators/${this.getFnameFromKey(key)}`, pem.ok.asJson())
      if (ret.isErr()) {
        return Promise.resolve(utils.errValue(ret.err))
      }
      return this.list(etc)
    }
    let list_ofs = argv.indexOf("list")
    if (list_ofs >= 0) {
      return this.list(etc) 
    }
    return Promise.resolve(cmd.Error.text("unhandeled"))
  }

}

export default DepotsCreators


