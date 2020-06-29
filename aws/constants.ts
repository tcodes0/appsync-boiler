import * as dev from './constants.dev'
import * as prod from './constants.prod'

export default function getContants(env: string) {
  if (env === dev.ENV.DEV) {
    return dev
  } else {
    return prod
  }
}
