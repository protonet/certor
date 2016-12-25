import Command from './command'

class DnsZoneUpdater implements Command {

  key: string = "dns-zone-updater"
  public start(argv: string[]) : Promise<any> {
    return null 
  }

}

export default DnsZoneUpdater