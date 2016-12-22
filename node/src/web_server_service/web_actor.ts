import * as http from 'http'

interface WebActor {
  url: string
  action(req: http.ServerRequest, res: http.ServerResponse): void
}

export default WebActor