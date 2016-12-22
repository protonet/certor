import Command from './command'

class CertReaper implements Command {
  key : string = "cert-reaper"

  public start(argv: string[]) {

  }
}

export default CertReaper