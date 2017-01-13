
import * as listHandler from './list_handler'
import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import * as utils from './utils'
import Domain from './domain'


export class NameServer {
  ip: string
  key?: string
  public static parse(a: string) {
    let j = JSON.parse(a) 
    let r = new NameServer()
    r.ip = j.ip
    r.key = j.key
    return r
  }
}

export class NameServerActor implements listHandler.Actor<NameServer> {
  public adder(key: NameServer) : (arr: NameServer[]) => NameServer[] {
    return (arr: NameServer[]) : NameServer[] => {
      if (!arr.find((l)=>l.ip==key.ip)) {
        arr.push(key)
        return arr;
      }
      return null;
    }
  }
  public deler(key: NameServer) : (arr: NameServer[]) => NameServer[] {
    return (arr: NameServer[]) : NameServer[] => {
      let post = arr.filter((l) => l.ip!=key.ip)
      if (post.length != arr.length) {
        return post;
      }
      return null;
    }
  }
  public async fromArgs(argv: string[], ofs: number) : Promise<listHandler.Valid<NameServer>> {
    let value = new NameServer()
    let ip_ofs = argv.indexOf("--ip")
    if (ip_ofs < 0) {
      return Promise.resolve({
        isValid: () => { return false },
        error : "need --ip option"
      })
    }
    value.ip = argv[ip_ofs+1]
    if (!value.ip || value.ip.length ==0) {
      return Promise.resolve({
        isValid: () => { return false },
        error : "need --ip option"
      })
    }
    let key_ofs = argv.indexOf("--key")
    if (key_ofs >= 0) {
      let pValue = await utils.parseValue(argv[key_ofs+1])
      if (pValue.isErr()) {
        return Promise.resolve({
          isValid: () => { return false },
          error : pValue.err.asText()
        })
      }
      value.key = pValue.ok.asJson()
    }
    return Promise.resolve({
      isValid : () => { return true },
      value : value
    })
  } 

  public geter(arr: NameServer[]) : NameServer[] {
    return arr
  }
  public toString(t: NameServer) : string {
    return JSON.stringify(t)
  }

  public validate(t: NameServer) : listHandler.Valid<NameServer> {
    if (t.ip && t.ip.length > 1) {
      return {
        isValid : () => { return true },
        value : t,
        error : null
      }
    } 
    return {
      isValid : () => { return false },
      value : null,
      error : "ip must be set"
    }
  }
}


export class DomainNameServers implements cmd.Command {
 key = "domain.nameservers"

 public async start(argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
    let wc = config.Certor.create(argv)
    etc = etc || await wc.etcd();

    let domain = await Domain.getDomain(argv)
    if (domain.isErr()) {
      return domain
    }

    let slh = new listHandler.ListHandler(`domains/${domain.ok.asJson()}/nameservers`, new NameServerActor())
    return slh.start(argv, etc)
  }
}

export default DomainNameServers
