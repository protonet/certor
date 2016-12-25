import Command from './command'

class DepotsReaper implements Command {
  key : string = "depots-reaper"
  public start(argv: string[]) : Promise<any> {
    return null 
  }

}

export default DepotsReaper