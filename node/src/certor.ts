import * as cmd from './command'

class Certor implements cmd.Command {
  key : string = "certor"
  public start(argv: string[]) : Promise<cmd.Result> {
    return Promise.resolve(cmd.Error.text("not implemented")) 
  }

}

export default Certor