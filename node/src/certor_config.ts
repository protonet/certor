import * as fs from 'fs';
import * as etcd from 'promise-etcd'

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

export class Certor {

  privateKey: string = null;
  certificate: string = null;

  redirectPort: number = 8080;
  applicationPort: number = 8443;

  redirectUrl: string = "http://unknown"

  clusterId: string = "";

  client: Key = new Key()

  etcdConfig: etcd.Config

  public credentials() {
    if (this.privateKey && this.certificate) {
      return {key: this.privateKey, cert: this.certificate};
    }
    return null;
  }

  public async etcd() {
    return etcd.Etcd.create(this.etcdConfig)
   }

  public static create(argv: string[]) : Certor {
    let wc = new Certor();
    let ofs = argv.indexOf("--privkey")
    if (ofs >= 0) {
      wc.privateKey = argv[ofs+1]
    } else {
      try {
        wc.privateKey  = fs.readFileSync('/etc/letsencrypt/live/clavator.com/privkey.pem', 'utf8');
      } catch (e) {
      }
    }
    ofs = argv.indexOf("--cerifcate")
    if (ofs >= 0) {
      wc.certificate = argv[ofs+1]
    } else {
      try {
        wc.certificate = fs.readFileSync('/etc/letsencrypt/live/clavator.com/fullchain.pem', 'utf8');
      } catch (e) {
      }
    }
    ofs = argv.indexOf("--redirect-port")
    if (ofs >= 0) {
      wc.redirectPort = ~~argv[ofs+1]
    } else {
      if (process.getuid() == 0) {
        wc.redirectPort = 80
      }
    }
    ofs = argv.indexOf("--application-port")
    if (ofs >= 0) {
      wc.applicationPort = ~~argv[ofs+1]
    } else {
      if (process.getuid() == 0) {
        wc.applicationPort = 443
      }
    }
    ofs = argv.indexOf("--redirect-url")
    if (ofs >= 0) {
      wc.redirectUrl = argv[ofs + 1]
    }

    ofs = argv.indexOf("--client-ca")
    if (ofs >= 0) {
      wc.client.ca = fs.readFileSync(argv[ofs + 1]).toString()
    }

    ofs = argv.indexOf("--client-cert")
    if (ofs >= 0) {
      wc.client.cert = fs.readFileSync(argv[ofs + 1]).toString()
    }

    ofs = argv.indexOf("--client-key")
    if (ofs >= 0) {
      wc.client.key = fs.readFileSync(argv[ofs + 1]).toString()
    }

    wc.etcdConfig = etcd.Config.start(argv, "certor")
 
    return wc
 }

}

// export default CertorConfig
