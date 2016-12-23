export interface Command {
  key: string
  start(argv: string[], cb: (err:string, res: string)=>void) : void
}
export default Command