import WebActor from './web_actor'
import * as http from 'http'

export class Create implements WebActor {
  url: string = "/v1/depot/create"


  public action(req: http.ServerRequest, res: http.ServerResponse) {

  }

}

export class Delete implements WebActor {
  url: string = "/v1/depot/delete"


  public action(req: http.ServerRequest, res: http.ServerResponse) {

  }

}

