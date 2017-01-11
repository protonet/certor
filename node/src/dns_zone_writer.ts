import * as cmd from './command'

class DnsZoneWriter implements cmd.Command {
  key: string = "dns-zone-writer"
  public start(argv: string[]) : Promise<cmd.Result> {
    return Promise.resolve(cmd.Error.text("Not Implemented", ))
  }

}

export default DnsZoneWriter