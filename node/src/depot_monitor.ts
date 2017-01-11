import * as cmd from './command'

class DepotMonitor implements cmd.Command {
  key: string = "depot-alive";
 
  public start(argv: string[]) : Promise<cmd.Result> {
    return Promise.resolve(cmd.Error.text("not implemented")) 
  }

}
export default DepotMonitor