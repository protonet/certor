export interface Command {
  key: string
  start(argv: string[]) : void
}
export default Command