import * as fs from 'fs';

class WebConfig {

  privateKey: string = null;
  certificate: string = null;

  redirectPort: number = 8080;
  applicationPort: number = 8443;

  redirectUrl: string = "http://unknown"

  clusterId: string = "";

  public credentials() {
    if (this.privateKey && this.certificate) {
      return {key: this.privateKey, cert: this.certificate};
    }
    return null;
  }

  public static create(argv: string[]) : WebConfig {
    let wc = new WebConfig();
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
    return wc
 }

}

export default WebConfig