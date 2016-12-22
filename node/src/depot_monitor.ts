import Command from './command'

class DepotMonitor implements Command {
  key: string = "depot-alive";
 
  public start(argv: string[]) {
    
  }

}
export default DepotMonitor