import Command from './command'

class Certor implements Command {
  key : string = "certor"
  public start(argv: string[]) : Promise<any> {
    return null 
  }

}

export default Certor