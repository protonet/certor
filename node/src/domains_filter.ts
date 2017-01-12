
import StringListHandler from './string_list_handler'
import * as listHandler from './list_handler'

export class DomainsFilter extends StringListHandler {
  constructor() {
    super("domains.filter")
    this.actor.validate = (t: string) : listHandler.Valid<string> => {
      let v = t
      if (t[0] == "!") {
        v = t.slice(1)
      } 
      if (v.length == 0) {
        return {
          isValid : () => { return false },
          value: t,
          error: "empty string"
        }
      }
      try {
        new RegExp(v)
        return {
          isValid : () => { return true }, 
          value: t
        }
      } catch (e) {
        return {
          isValid : () => { return false },
          value: t,
          error: "invalid regexp"
        }
      }
    }
  }
}

export default DomainsFilter
