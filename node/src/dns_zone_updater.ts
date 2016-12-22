import Command from './command'

class DnsZoneUpdater implements Command {

  key: string = "dns-zone-updater"
  public start(argv: string[]) {
    
  }

}

export default DnsZoneUpdater