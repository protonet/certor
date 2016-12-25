import Command from './command'

class DepotMonitor implements Command {
  key: string = "depot-alive";
 
  public start(argv: string[]) : Promise<any> {
    return null 
  }

}
export default DepotMonitor