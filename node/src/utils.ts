import * as fs from 'fs-promise'
import * as cmd from './command'

export async function parseValue(value: string) : Promise<cmd.Result> {
  if (!value || value.length == 0) {
    return Promise.resolve(cmd.Error.text("you need to set the setvalue"))
  }
  if (value[0] == "@") {
    try {
      value = (await fs.readFile(value.slice(1))).toString()
    } catch (e) {
      return Promise.resolve(cmd.Error.text(e))
    }
  }
  return Promise.resolve(new cmd.Ok({
    asJson : () => { return value },
    asText : () => { return value }
  }))
}

export function okValue(value: any) {
  return new cmd.Ok({
        asJson : () => { return value },
        asText : () => { return value }
      })
}

export function errValue(value: any) {
  return new cmd.Error({
    asJson : () => { return value },
    asText : () => { return JSON.stringify(value) }
  })
}