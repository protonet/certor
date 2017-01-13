

import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'

// import * as sshpk from 'sshpk'

export class DepotsCreators implements cmd.Command {
  key: string = "depots.creators"

  public async start(argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();
  
    let delete_ofs = argv.indexOf("delete")
    if (delete_ofs >= 0) {
      let id = argv[delete_ofs+1] 
    }
    let add_ofs = argv.indexOf("add")
    if (add_ofs >= 0) {
      let pem = argv[add_ofs+1] 
    }
    let list_ofs = argv.indexOf("list")
    if (list_ofs >= 0) {
    }
    return Promise.resolve(cmd.Error.text("unhandeled"))
  }

}

export default DepotsCreators


