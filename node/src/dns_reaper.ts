import Command from './command'

class DnsReaper implements Command {
  key : string = "depots-reaper"
  public start(argv: string[]) : Promise<any> {
    return null 
  }

}

export default DnsReaper