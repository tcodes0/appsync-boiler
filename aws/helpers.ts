import * as SSM from '@aws-cdk/aws-ssm'
import * as CDK from '@aws-cdk/core'
import * as Appsync from '@aws-cdk/aws-appsync'
import * as Dynamodb from '@aws-cdk/aws-dynamodb'
import * as ES from '@aws-cdk/aws-elasticsearch'
import { DDB_TABLES } from './constants.dev'
import { Context, Callback } from 'aws-lambda'

export const getParam = (scope: CDK.Construct, name: string) => {
  return SSM.StringParameter.valueForStringParameter(scope, name)
}

export interface DomainProps extends CDK.StackProps {
  name: string
}

export type TableRecord = Record<keyof typeof DDB_TABLES, Dynamodb.Table>
export type TableNameRecord = Record<keyof typeof DDB_TABLES, Dynamodb.Table['tableName']>
export type ModuleArgs = {
  graphql: Appsync.GraphQLApi
  stack: CDK.Stack
  fieldDataSource: Appsync.LambdaDataSource
  fieldArrayDataSource?: Appsync.LambdaDataSource
  tables: TableRecord
  elasticSearchDomain?: ES.CfnDomain
}

export type JsObject<Value = any> = Record<string, Value>

export type TypedFunction<Args extends any[] = any[], Return = void> = (...args: Args) => Return

export type ElasticSearchLambdaVars = {
  endpoint: string
  postIndex: string
}

export type HandlerExtraParams = {
  tables: TableNameRecord
  region?: string
  elasticSearch?: ElasticSearchLambdaVars
}

export type Handler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: Context,
  callback: Callback<TResult>,
  { tables }: HandlerExtraParams
) => void | Promise<TResult>
