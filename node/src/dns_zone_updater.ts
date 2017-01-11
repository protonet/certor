import * as cmd from './command'

class DnsZoneUpdater implements cmd.Command {

  key: string = "dns-zone-updater"
  public start(argv: string[]) : Promise<cmd.Result> {
    return Promise.resolve(cmd.Error.text("Not Implemented", ))
  }

}

export default DnsZoneUpdater