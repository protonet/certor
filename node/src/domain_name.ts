
import * as cmd from './command'
import * as etcd from 'promise-etcd'

class CertPackageListHandler {
  public start(argv: string[], etc: etcd.Etcd) : Promise<any> {
    return null
  }
  public static create(key: string) : CertPackageListHandler {
    return null
  }
}

export default class DomainName implements cmd.Command {
  key: string = "domain-name"
  public async start(argv: string[], etc : etcd.Etcd = null) : Promise<cmd.Result> {
    let domain_name_ofs = argv.indexOf("--domain-name")
    if (domain_name_ofs >= 0) {
      let name = argv[domain_name_ofs+1]
      if (!name || name.length == 0) {
        return Promise.resolve(cmd.Error.text("unhandled"))
      }
      let domain_id = null
      // names CertPackageListHandler (add/del(creators))
      return CertPackageListHandler.create(`domains/${domain_id}/names/${name}.package`).start(argv, etc)
    }
    return Promise.resolve(cmd.Error.text("domain actions not found"))
  }
}