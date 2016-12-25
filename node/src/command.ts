export interface Command {
  key: string
  start(argv: string[]) : Promise<any>
}
export default Command