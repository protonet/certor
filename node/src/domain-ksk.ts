
import StringListHandler from './string_list_handler'
import * as listHandler from './list_handler'
import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import DomainKeys from './domain-keys'

export class DomainKsk implements cmd.Command {
 key = "domain.ksk"

 public async start(argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
   return (new DomainKeys()).start("ksk", argv, etc)
 }
}

export default DomainKsk
