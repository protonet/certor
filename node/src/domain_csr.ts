
import StringListHandler from './string_list_handler'
import * as listHandler from './list_handler'
import * as cmd from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'
import * as utils from './utils'
import DomainKeys from './domain-keys'
import * as sshpk from 'sshpk'
import * as pprocess from 'process-promises'
import * as pfs from 'fs-promise'


export interface CreateKeyAction {
  (fname: string) : Promise<utils.Result<string>>
}

async function createPrivateKey(fname: string) : Promise<utils.Result<utils.WithFname<sshpk.Key>>> {
  console.log("Create Private Key")
  try {
    let pCmd = await pprocess.exec(`openssl genrsa -out ${fname} 2048`)
  } catch (e) {
    return utils.ErrorResult.resolve<utils.WithFname<sshpk.Key>>("openssl genrsa failed")
  }
  let val = await utils.parseValueWithFname(`@#{fname}`) 
  if (val.isErr()) {
    return utils.ErrorResult.resolve<utils.WithFname<sshpk.Key>>(val.err)
  }
  try {
    let key = sshpk.parseKey(val.ok.value, "pem")
    return utils.OkResult.resolve<utils.WithFname<sshpk.Key>>({
      value: key,
      fname: val.ok.fname
    })
  } catch (e) {
    return utils.ErrorResult.resolve<utils.WithFname<sshpk.Key>>(e)
  }
}


export class ClientCert {
  key?: utils.WithFname<sshpk.Key> = null
  cert?: utils.WithFname<sshpk.Certificate> = null
  cas: utils.WithFname<sshpk.Certificate>[] = []

  private static async createKey(str: string, errText: string, createKey: CreateKeyAction)
    : Promise<utils.Result<utils.WithFname<sshpk.Key>>> {
    if (errText == null && createKey) {
      let fname = str.slice(1)
      let ck = await createPrivateKey(fname)
      if (ck.isErr()) {
        return utils.ErrorResult.resolve<utils.WithFname<sshpk.Key>>(ck.err)
      }
      return utils.OkResult.resolve<utils.WithFname<sshpk.Key>>(ck.ok);
    } else {
      return utils.ErrorResult.resolve<utils.WithFname<sshpk.Key>>(errText)
    }
  }

  public static async readKeyFromArg(str: string, createKey?: CreateKeyAction) : 
    Promise<utils.Result<utils.WithFname<sshpk.Key>>> {
    let pem = await utils.parseValueWithFname(str)
    if (pem.isErr()) {
      return ClientCert.createKey(str, pem.err, createKey)
    }
    try {
      let key = sshpk.parseKey(pem.ok.value, "pem")
      return utils.OkResult.resolve<utils.WithFname<sshpk.Key>>({
        value: key,
        fname: pem.ok.fname
      })
    } catch (e) {
      return utils.ErrorResult.resolve<utils.WithFname<sshpk.Key>>(e)
    }
  }

  private static async readKey(argv: string[]) : Promise<utils.Result<utils.WithFname<sshpk.Key>>> {
    let clientKey_ofs = argv.indexOf("--clientKey")
    if (clientKey_ofs >= 0) {
      return ClientCert.readKeyFromArg(argv[clientKey_ofs+1])
    }
    return utils.OkResult.resolve<utils.WithFname<sshpk.Key>>(null)
  }

  private static async readCert(argv: string[]) : Promise<utils.Result<utils.WithFname<sshpk.Certificate>>> {
    let clientCert_ofs = argv.indexOf("--clientCert")
    if (clientCert_ofs >= 0) {
      let pem = await utils.parseValueWithFname(argv[clientCert_ofs+1])
      if (pem.isErr()) {
        return utils.ErrorResult.resolve<utils.WithFname<sshpk.Certificate>>(pem.err)
      }
      try {
        let key = sshpk.parseCertificate(pem.ok.value, "pem")
        return utils.OkResult.resolve<utils.WithFname<sshpk.Certificate>>({
          fname: pem.ok.fname,
          value: key
        })
      } catch (e) {
        return utils.ErrorResult.resolve<utils.WithFname<sshpk.Certificate>>(e)
      }
    }
    return utils.OkResult.resolve<utils.WithFname<sshpk.Certificate>>(null)
  }

   private static async readCAs(argv: string[]) : Promise<utils.Result<utils.WithFname<sshpk.Certificate>[]>> {
     let ret : utils.WithFname<sshpk.Certificate>[] = []
     for (let ofs = argv.indexOf("--clientCA"); ofs >= 0; ofs = argv.indexOf("--clientCA", ofs + 1)) {
        let pem = await utils.parseValueWithFname(argv[ofs+1])
        if (pem.isErr()) {
          return utils.ErrorResult.resolve<utils.WithFname<sshpk.Certificate>[]>(pem.err)
        }
        try {
          let key = sshpk.parseCertificate(pem.ok.value, "pem")
          ret.push({
            fname: pem.ok.fname,
            value: key
          })
        } catch (e) {
          return utils.ErrorResult.resolve<utils.WithFname<sshpk.Certificate>[]>(e)
        }
      }
      return utils.OkResult.resolve< utils.WithFname<sshpk.Certificate>[]>(ret)
   }



  public static async from(argv: string[]) : Promise<utils.Result<ClientCert>> {
    let cc = new ClientCert()
    let rKey = await ClientCert.readKey(argv)
    if (rKey.isErr()) {
      return utils.ErrorResult.resolve<ClientCert>(rKey.err)
    }
    cc.key = rKey.ok
    let rCert = await ClientCert.readCert(argv)
    if (rCert.isErr()) {
      return utils.ErrorResult.resolve<ClientCert>(rCert.err)
    }
    cc.cert = rCert.ok
    let rCas = await ClientCert.readCAs(argv)
    if (rCas.isErr()) {
      return utils.ErrorResult.resolve<ClientCert>(rCas.err)
    }
    cc.cas = rCas.ok
    return utils.OkResult.resolve<ClientCert>(cc)
  }
}

async function getOpenSslDir() : Promise<string> {
  try {
    let pSsl = await pprocess.exec("openssl version -d")
    let lines = pSsl.stdout.split(/[\n\r]+/)
    for (let i = 0; i < lines.length; ++i) {
      let sp = lines[i].split(/:\s*/)
      if (sp.length == 2 && sp[0] == "OPENSSLDIR") {
        return Promise.resolve(JSON.parse(sp[1]))
      }
    }
  } catch(e) {
  }
  return Promise.resolve(null)
}

async function createCSR(dom: string, key: utils.WithFname<sshpk.Key>) : Promise<utils.Result<string>> {
  try {
    let opensslDir = await getOpenSslDir();
    if (!opensslDir) {
      return utils.ErrorResult.resolve<string>("openssl config directory not found")
    }
    let conf = (await pfs.readFile(`${getOpenSslDir()}`)).toString()
    conf += `\nSAN\nsubjectAltName=DNS:${dom}`
    let csrConfFname = `./certor.csr.${dom}.cnf`
    await pfs.writeFile(csrConfFname, conf)
    if (!key.fname) {
      let fpr = key.value.fingerprint("sha256").toString("hex").split(":").join("")
      key.fname = `./certor.${fpr}.key.pem`
      await pfs.writeFile(key.fname, key.value.toString("pem", null))
    }
    let pCsr = await pprocess.exec(`openssl req -new -sha256 -key ${key.fname} `+
      `-subj "/CN=${dom}" -reqexts SAN -config ${csrConfFname}`)
    await pfs.unlink(csrConfFname)
    return utils.OkResult.resolve<string>(pCsr.stdout)
  } catch(e) {
    return utils.ErrorResult.resolve<string>(e)
  }
}
// openssl req -new -sha256 -key private.pem -out csr -subj "/CN=de.doof.de/serialNumber=5157550" -reqexts SAN -config k
// [SAN]
// subjectAltName=DNS:www.doof.de

export class ApiServers {
  srvs: string[] = []

  public static async from(argv: string[]) : Promise<utils.Result<ApiServers>> {
  // --apiServer
  let apiServers = new ApiServers
  for(let i = argv.indexOf("--apiServer"); i >= 0; i = argv.indexOf("--apiServer", i+1)) {
    let url = argv[i+1]
    if (!url || url.length <= 0) {
      return utils.ErrorResult.resolve<ApiServers>(`unknown url:${url}`)
    }
    apiServers.srvs.push(url)
  }
  if (apiServers.srvs.length > 0) {
    return utils.ErrorResult.resolve<ApiServers>("need atleast one apiServer");
  }
  return utils.OkResult.resolve<ApiServers>(apiServers)
  }
}

export class DomainCsr implements cmd.Command {
 key = "domain.csr"

 public async start(argv: string[], etc: etcd.Etcd = null) : Promise<cmd.Result> {
   let apiServers = await ApiServers.from(argv)
   if (apiServers.isErr()) {
     return utils.promiseErr(apiServers.err)
   }
   let clientCert = await ClientCert.from(argv)
   if (clientCert.isErr()) {
     return utils.promiseErr(clientCert.err)
   }
   // sendCsr
   if (argv.indexOf("sendCsr") >= 0) {
     // --key @file
     let key_ofs = argv.indexOf("--key")
     if (key_ofs < 0) {
       return utils.promiseErr("--key is required")
     }
     let csr_ofs = argv.indexOf("--csr")
     if (csr_ofs < 0) {
       return utils.promiseErr("--csr is required")
     }

    //  let key = await ClientCert.readKeyFromArg(argv[key_ofs+1], async (fname: string) => {
 
    //  })
    //  if (key.isErr()) {
    //    return utils.promiseErr(key.err)
    //  }
    //  if (!key.ok) {
    //    return utils.promiseErr("invalid key")
    //  }
     let fqdn_ofs = argv.indexOf("--fqdn")
     if (fqdn_ofs < 0) {
       return utils.promiseErr("--fqdn is required")
     }
   }
   return Promise.resolve(cmd.Error.text("falling through"))
 }
}

export default DomainCsr
