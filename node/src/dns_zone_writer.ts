import Command from './command'

class DnsZoneWriter implements Command {
  key: string = "dns-zone-writer"
  public start(argv: string[]) : Promise<any> {
    return null 
  }

}

export default DnsZoneWriter