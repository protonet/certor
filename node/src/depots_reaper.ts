import Command from './command'
import * as etcd from './etcd'
import WaitMaster from './wait_master'

class DepotsReaper implements Command {
  key : string = "depots-reaper"
  public start(argv: string[], etc : etcd.Etcd = null) : Promise<any> {
    // wait to get reaper
    return WaitMaster.create("depots-reaper", etc, 1000, 1000, () => {
      return null
    })
  }

}

export default DepotsReaper