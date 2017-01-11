import * as cmd from './command'

class CertReaper implements cmd.Command {
  key : string = "cert-reaper"

  public start(argv: string[]) : Promise<cmd.Result> {
    return Promise.resolve(cmd.Error.text("Not Implemented", ))
  }
}

export default CertReaper