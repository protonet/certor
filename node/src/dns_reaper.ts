import * as cmd from './command'

class DnsReaper implements cmd.Command {
  key : string = "depots-reaper"
  public start(argv: string[]) : Promise<cmd.Result> {
   return Promise.resolve(cmd.Error.text("Not Implemented", ))
  }

}

export default DnsReaper