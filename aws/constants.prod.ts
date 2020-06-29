import * as Lambda from '@aws-cdk/aws-lambda'
import path from 'path'

/**
 * Cognito
 */
export const USER_POOL_NAME = 'BoilerUserPool'
export const USER_POOL_ID = 'BoilerUserPool-1'
/**
 * Others
 */
export enum ENV {
  PROD = 'production',
  DEV = 'development',
}
export const STACK_ID = 'BoilerStack-1'
export const API_ID = 'BoilerGraphQLApi-1'
export const API_NAME = 'BoilerGraphQLApi'
export const API_KEY_DESCRIPTION = 'Boiler API Key'
export const LAMBDA_ASSET_DIR = '../build/lambdas'
export const QUERY_TYPE_LAMBDA = 'queryTypeLambda'
export const LAMBDA = {
  /**
   * Mutation
   */
  mutationLambda: {
    name: 'mutationLambda',
    description: 'Handles all graphql Mutation operations',
    dataSourceName: 'mutationLambdaDataSource',
  },
  /**
   * Query
   */
  queryLambda: {
    name: 'queryLambda',
    description: 'Handles all graphql Query operations',
    dataSourceName: 'queryLambdaDataSource',
  },
  /**
   * Fields
   */
  fieldLambda: {
    name: 'fieldLambda',
    description: 'Resolves any type within a parent type',
    dataSourceName: 'fieldLambdaDataSource',
  },
  /**
   * Field Array
   */
  fieldArrayLambda: {
    name: 'fieldArrayLambda',
    description: 'Resolves any array type within a parent type',
    dataSourceName: 'fieldArrayLambdaDataSource',
  },
  /**
   * Status
   */
  statusLambda: {
    name: 'statusLambda',
    description: 'Returns meta info about the running server',
    dataSourceName: 'statusLambdaDataSource',
  },
} as const

export const lambdaParams = (functionName: string) => ({
  runtime: Lambda.Runtime.NODEJS_12_X,
  functionName,
  code: Lambda.Code.fromAsset(path.join(__dirname, LAMBDA_ASSET_DIR, functionName)),
  handler: `index.handler`,
})

export const DDB_TABLES = {
  users: { id: 'UsersTable', name: 'Users', description: 'Users Table' },
} as const
