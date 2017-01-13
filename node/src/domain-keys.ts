
import StringListHandler from './string_list_handler'
import * as listHandler from './list_handler'
import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import Domain from './domain'
import * as utils from './utils'

import * as fs from 'fs-promise'

export class DomainKeys {
 private async get(style: string, domain: string, etc: etcd.Etcd) {
    let ret = await etc.getRaw(`domains/${domain}/${style}`)
    if (ret.isErr()) {
      return Promise.resolve(utils.errValue(ret.err))
    }
    return Promise.resolve(utils.okValue(ret.node.value))
 }

 public async start(style: string, argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();

    let pdomain = await Domain.getDomain(argv)
    if (pdomain.isErr()) {
      return pdomain
    }
    let domain = pdomain.ok.asJson()
    let get_ofs = argv.indexOf("get")
    if (get_ofs >= 0) {
      return this.get(style, domain, etc)
    }
    let set_ofs = argv.indexOf("set")
    if (set_ofs >= 0) {
      let setValue = await utils.parseValue(argv[set_ofs+1])
      if (setValue.isErr()) {
        return setValue
      }
      let ret = await etc.setRaw(`domains/${domain}/${style}`, setValue.ok.asJson())
      if (ret.isErr()) {
        return Promise.resolve(utils.errValue(ret.err))
      }
      return setValue
    }
    let del_ofs = argv.indexOf("del")
    if (del_ofs >= 0) {
      let get = await this.get(style, domain, etc)
      if (get.isErr()) {
        return get
      }
      let ret = await etc.delete(`domains/${domain}/${style}`)
      if (ret.isErr()) {
        return Promise.resolve(utils.errValue(ret.err))
      }
      return get
    }
    return Promise.resolve(cmd.Error.text("falling through"))
  }
}

export default DomainKeys
