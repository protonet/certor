import Command from './command'

class CertReaper implements Command {
  key : string = "cert-reaper"

  public start(argv: string[]) : Promise<any> {
    return null
  }
}

export default CertReaper