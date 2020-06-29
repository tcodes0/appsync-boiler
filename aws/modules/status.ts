import * as Lambda from '@aws-cdk/aws-lambda'
import { LAMBDA, lambdaParams } from '../constants.dev'
import { createResolver } from '../resolver'
import { ModuleArgs } from '../helpers'

export const statusModule: (ModuleArgs: ModuleArgs) => void = ({ stack, graphql }) => {
  const statusLambda = new Lambda.Function(stack, LAMBDA.statusLambda.name, {
    ...lambdaParams(LAMBDA.statusLambda.name),
    environment: {
      COMMIT_SHA: stack.node.tryGetContext('COMMIT_SHA') || 'not found on lambda ENV',
    },
  })
  const statusDataSource = graphql.addLambdaDataSource(
    LAMBDA.statusLambda.dataSourceName,
    LAMBDA.statusLambda.description,
    statusLambda
  )
  createResolver('Query.status', statusDataSource)
}
