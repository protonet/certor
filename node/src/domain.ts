
import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import StringListHandler from './string_list_handler'
import DepotsCreators from './depots_creators'
import * as path from 'path'
import * as ipranges from './ipranges'
import listAction from './list_action'

class Certificate {

}
class FileHandler {
  public start(argv: string[], etc: etcd.Etcd) : Promise<cmd.Result> {
    return null
  }
  static create(key: string) : FileHandler {
    return null
  }
}

class CertPackage {
  fpr: string
  csr: Certificate
  cert?: Certificate
}

export class DomainCreators extends StringListHandler {
  constructor() {
    super("domain.creators")
  }
}



export class Domain implements cmd.Command {
  key: string = "domain"

  public async valid_domain_name(domain_name: string, etc: etcd.Etcd) : Promise<boolean> {
    return null;
  }

  public async valid_domain_creator(domain_creator: string, etc: etcd.Etcd) : Promise<boolean> {
    return null;
  }


  public async start(argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();

    // creators StringListHandler
    let domain_creators_ofs = argv.indexOf("domain-creators")
    if (domain_creators_ofs >= 0) {
      return (new DomainCreators()).start(argv, etc)
    }
    // list
    let list_ofs = argv.indexOf("list")
    if (list_ofs >= 0) {
      return listAction("domains", etc)
    }
    
    let domain_id_ofs = argv.indexOf("--domain-id")
    let domain_id = argv[domain_id_ofs + 1]
    if (domain_id_ofs < 0 || !domain_id || domain_id.length <= 0) {
      console.error("please set --domain-id")
      return Promise.resolve(cmd.Error.text("please set --domain-id"))
    }
    if (!(await this.valid_domain_name(domain_id, etc))) {
      console.error(`invalid domain_name:${domain_id}`)
      return Promise.resolve(cmd.Error.text(`invalid domain_name:${domain_id}`))
    }

    let domain_creator_ofs = argv.indexOf("--domain-creator")
    let domain_creator = argv[domain_creator_ofs + 1]
    if (domain_creator_ofs < 0 || !domain_creator || domain_creator.length <= 0) {
      console.error("please set --domain-id")
      return Promise.resolve(cmd.Error.text("please set --domain-id"))
    }
    if (!(await this.valid_domain_creator(domain_creator, etc))) {
      console.error(`invalid domain_creator:${domain_creator}`)
      return Promise.resolve(cmd.Error.text(`invalid domain_creator:${domain_creator}`))
    }

    // zone // domains.creators
    // zsk // domains.creators
    // ksk // domains.creators
    // rndcs // domains.creators
    ["zone", "zsk", "ksk", "rndcs"].forEach((key) => {
      let ofs = argv.indexOf(key)
      if (ofs >= 0) { 
        return FileHandler.create(`domains/${domain_id}/${key}`).start(argv, etc)
      }
    })
    // names/list // domains.creators
    let names_ofs = argv.indexOf("names")
    if (names_ofs >= 0) {
      if (argv[names_ofs+1] == "list") {
        return listAction(`domains/${domain_id}/names`, etc)
      }
    }

    return Promise.resolve(cmd.Error.text("unhandled"))
  }


}

export default Domain
