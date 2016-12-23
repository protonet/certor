import Command from './command'

class CertReaper implements Command {
  key : string = "cert-reaper"

  public start(argv: string[], cb: (err:string, res:string)=>void) {

  }
}

export default CertReaper