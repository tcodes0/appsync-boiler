import * as Appsync from '@aws-cdk/aws-appsync'
import { BaseResolverProps } from '@aws-cdk/aws-appsync'

const lambdaWithStash = `
#set($ctx.stash.newId = $util.autoId())
#set($ctx.stash.newId2 = $util.autoId())
#set($ctx.stash.newId3 = $util.autoId())
#set($ctx.stash.newId4 = $util.autoId())
#set($ctx.stash.newId5 = $util.autoId())
{"version": "2017-02-28", "operation": "Invoke", "payload": $util.toJson($ctx)}
`

export const request = {
  lambdaWithStash,
} as const

const passThrough = `$util.toJson($ctx.result)`

export const response = {
  passThrough,
} as const

export const resolverDefaults = {
  requestMappingTemplate: Appsync.MappingTemplate.fromString(lambdaWithStash),
  responseMappingTemplate: Appsync.MappingTemplate.fromString(passThrough),
}

const splitAtDot = /(\w+)[.](\w+)/
export const createResolver = (
  mappingString: string,
  dataSource: Appsync.LambdaDataSource,
  overrides?: Partial<BaseResolverProps>
) => {
  const splitted = splitAtDot.exec(mappingString)
  if (!splitted) {
    throw Error(`Invalid mappingString ${mappingString}. Must split at dot with regex /(\\w+)[.](\\w+)/`)
  }
  const [, typeName, fieldName] = splitted
  return dataSource.createResolver({
    typeName,
    fieldName,
    ...resolverDefaults,
    ...overrides,
  })
}
