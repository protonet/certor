import * as fs from 'fs';
import * as Etcd from 'node-etcd';

class Key {
  ca: string = null;
  cert: string = null;
  key: string = null;

  isSet() : Key {
    if (this.ca && this.cert && this.key) {
      return this
    }
    return null;
  }
}

export class EtcdHelper {
  etcd: Etcd
  cfg: Certor
  constructor(cfg: Certor) {
    this.cfg = cfg
  }
  public static create(cfg: Certor, cb: (etcdh: EtcdHelper)=>void) : void {
    let etcdh = new EtcdHelper(cfg)
    let connStr : string;
    if (cfg.client.isSet()) {
      connStr = `etcd:TLS:${cfg.etcd_urls}`
      etcdh.etcd = new Etcd(cfg.etcd_urls, cfg.client)
    } else {
      connStr = `etcd:${cfg.etcd_urls}`
      etcdh.etcd = new Etcd(cfg.etcd_urls)
    }
    etcdh.etcd.selfStats((err, res) => {
        if (err) {
          console.error("Failed to create: etcd")
          cb(null);
          return
        }
        // console.log(err, res)
        console.log(`OK:${res.name} ${connStr} leader is: ${res['leaderInfo']['leader']} `)
        cb(etcdh)
    })
  }
  public build_url(key :string) : string {
    let url = `/certor/${key}`
    if (this.cfg.clusterId) {
      url = `/certor/${this.cfg.clusterId}/${key}`
    }
    return url
  }

  public get(key :string, cb: (err: any, res:string)=>void) {
    this.etcd.get(this.build_url(key), cb);
  }
  public set(key :string, val: string, cb: (err: any, res:string)=>void) {
    this.etcd.set(this.build_url(key), val, cb)
  }
}

export class Certor {

  privateKey: string = null;
  certificate: string = null;

  redirectPort: number = 8080;
  applicationPort: number = 8443;

  redirectUrl: string = "http://unknown"

  clusterId: string = "";

  client: Key = new Key()

  etcd_urls: string[] = []

  public credentials() {
    if (this.privateKey && this.certificate) {
      return {key: this.privateKey, cert: this.certificate};
    }
    return null;
  }

  public etcd(cb: (etcdh: EtcdHelper)=> void) {
    return EtcdHelper.create(this, cb)
   }

  public static create(argv: string[]) : Certor {
    let wc = new Certor();
    let ofs = argv.indexOf("--privkey")
    if (ofs > 0) {
      wc.privateKey = argv[ofs+1]
    } else {
      try {
        wc.privateKey  = fs.readFileSync('/etc/letsencrypt/live/clavator.com/privkey.pem', 'utf8');
      } catch (e) {
      }
    }
    ofs = argv.indexOf("--cerifcate")
    if (ofs > 0) {
      wc.certificate = argv[ofs+1]
    } else {
      try {
        wc.certificate = fs.readFileSync('/etc/letsencrypt/live/clavator.com/fullchain.pem', 'utf8');
      } catch (e) {
      }
    }
    ofs = argv.indexOf("--redirect-port")
    if (ofs > 0) {
      wc.redirectPort = ~~argv[ofs+1]
    } else {
      if (process.getuid() == 0) {
        wc.redirectPort = 80
      }
    }
    ofs = argv.indexOf("--application-port")
    if (ofs > 0) {
      wc.applicationPort = ~~argv[ofs+1]
    } else {
      if (process.getuid() == 0) {
        wc.applicationPort = 443
      }
    }
    ofs = argv.indexOf("--redirect-url")
    if (ofs > 0) {
      wc.redirectUrl = argv[ofs + 1]
    }
    ofs = argv.indexOf("--cluster-id")
    if (ofs > 0) {
      wc.clusterId = argv[ofs + 1]
    }

    ofs = argv.indexOf("--client-ca")
    if (ofs > 0) {
      wc.client.ca = fs.readFileSync(argv[ofs + 1]).toString()
    }

    ofs = argv.indexOf("--client-cert")
    if (ofs > 0) {
      wc.client.cert = fs.readFileSync(argv[ofs + 1]).toString()
    }

    ofs = argv.indexOf("--client-key")
    if (ofs > 0) {
      wc.client.key = fs.readFileSync(argv[ofs + 1]).toString()
    }

    for(ofs = argv.indexOf("--etcd-url"); ofs >= 0; ofs = argv.indexOf("--etcd-url", ofs+1)) {
      wc.etcd_urls.push(argv[ofs + 1])
    }

    return wc
 }

}

// export default CertorConfig
