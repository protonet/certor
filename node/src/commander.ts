

import Command from './command'

export class Commander {
  commands: Command[] = [] 
  public register(c: Command) {
    this.commands.push(c)
  }
  public dispatch(argv: string[], cb: (err:string, res:string)=>void) {
    argv.forEach((arg) => {
      if (('A' <= arg[0] && arg[0] <= 'Z') ||
          ('a' <= arg[0] && arg[0] <= 'z')) {
        this.commands.forEach((cmd) => {
          if (cmd.key == arg) {
            cmd.start(argv, cb)
          }
        })
      }  
    })
  }
}

export default Commander;