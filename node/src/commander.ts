

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
            // debugger
            let ret = await cmd.start(argv)
            if (ret.isErr()) {
              let fnErrName = ret.err.asText
              if (argv.indexOf("--json")) {
                fnErrName = () => JSON.stringify(ret.err.asJson())
              }
              console.error(fnErrName())
              process.exit(42)
            } else {
              let fnOkName = ret.ok.asText.bind(ret.ok)
              if (argv.indexOf("--json") >= 0) {
                // console.log(">>>>json", argv)
                fnOkName = () => JSON.stringify(ret.ok.asJson())
              }
              console.log(fnOkName())
              process.exit(0)
            }
           }
        })
      }  
    })
  }
}

export default Commander;