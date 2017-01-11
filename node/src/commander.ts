

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
        this.commands.forEach(async (cmd) => {
          if (cmd.key == arg) {
            let ret = await cmd.start(argv)
            let fnErrName = ret.err.asText
            let fnOkName = ret.ok.asText
            if (argv.indexOf("--json")) {
              fnErrName = () => JSON.stringify(ret.err.asJson())
              fnOkName = () => JSON.stringify(ret.ok.asJson())
            }
            if (ret.isErr()) {
              console.error(fnOkName())
              process.exit(42)
            } else {
              console.log(fnErrName())
              process.exit(0)
            }
           }
        })
      }  
    })
  }
}

export default Commander;