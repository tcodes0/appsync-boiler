/* eslint-disable @typescript-eslint/no-use-before-define */
import * as CDK from '@aws-cdk/core'
import * as Appsync from '@aws-cdk/aws-appsync'
import * as Cognito from '@aws-cdk/aws-cognito'
import * as Dynamodb from '@aws-cdk/aws-dynamodb'
import * as Lambda from '@aws-cdk/aws-lambda'
import * as Iam from '@aws-cdk/aws-iam'

import { TableRecord } from './helpers'
import getConstants from './constants'
import { statusModule } from './modules/status'
import { createResolver } from './resolver'
import { userModule } from './modules/user'
import { USER_POOL_CLIENT_ID, USER_POOL_CLIENT_NAME, IDENTITY_POOL_ID, IDENTITY_POOL_NAME } from './constants.dev'

class DevStack extends CDK.Stack {
  /**
   * development or production
   */
  public readonly mode: string = this.node.tryGetContext('mode')
  constructor(scope: CDK.Construct, id: string) {
    super(scope, id)
    /************
     * Env Check*
     ************/
    const {
      USER_POOL_NAME,
      USER_POOL_ID,
      API_ID,
      API_NAME,
      API_KEY_DESCRIPTION,
      DDB_TABLES,
      LAMBDA,
      lambdaParams,
      ENV,
    } = getConstants(this.mode)
    const isProd = this.mode !== ENV.PROD
    /***********
     * Cognito *
     ***********/
    const UserPool = new Cognito.UserPool(this, USER_POOL_ID, {
      userPoolName: USER_POOL_NAME,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your Boiler Account!',
        emailBody: 'Hello! Your verification code is {####}',
        emailStyle: Cognito.VerificationEmailStyle.CODE,
        smsMessage: 'The verification code to your new account is {####}',
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        tempPasswordValidity: CDK.Duration.days(7),
        minLength: 6,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
      },
    })
    const UserPoolClient = new Cognito.UserPoolClient(this, USER_POOL_CLIENT_ID, {
      generateSecret: false,
      userPool: UserPool,
      userPoolClientName: USER_POOL_CLIENT_NAME,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        refreshToken: true,
        userSrp: true,
      },
    })
    const IdentityPool = new Cognito.CfnIdentityPool(this, IDENTITY_POOL_ID, {
      allowUnauthenticatedIdentities: true,
      allowClassicFlow: false,
      identityPoolName: IDENTITY_POOL_NAME,
      cognitoIdentityProviders: [
        {
          clientId: UserPoolClient.userPoolClientId,
          providerName: UserPool.userPoolProviderName,
        },
      ],
    })
    const AuthenticatedRole = new Iam.Role(this, 'CognitoDefaultAuthenticatedRole', {
      assumedBy: new Iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': IdentityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    })
    AuthenticatedRole.addToPolicy(
      new Iam.PolicyStatement({
        effect: Iam.Effect.ALLOW,
        actions: ['mobileanalytics:PutEvents', 'cognito-sync:*', 'cognito-identity:*'],
        resources: ['*'],
      })
    )
    const UnauthenticatedRole = new Iam.Role(this, 'CognitoDefaultUnauthenticatedRole', {
      assumedBy: new Iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': IdentityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    })
    UnauthenticatedRole.addToPolicy(
      new Iam.PolicyStatement({
        effect: Iam.Effect.ALLOW,
        actions: ['mobileanalytics:PutEvents', 'cognito-sync:*'],
        resources: ['*'],
      })
    )
    new Cognito.CfnIdentityPoolRoleAttachment(this, 'DefaultValid', {
      identityPoolId: IdentityPool.ref,
      roles: {
        unauthenticated: UnauthenticatedRole.roleArn,
        authenticated: AuthenticatedRole.roleArn,
      },
    })
    /***********
     * Appsync *
     ***********/
    const Graphql = new Appsync.GraphQLApi(this, API_ID, {
      name: API_NAME,
      logConfig: {
        fieldLogLevel: Appsync.FieldLogLevel.ALL,
      },
      authorizationConfig: {
        defaultAuthorization: {
          userPool: UserPool,
          defaultAction: Appsync.UserPoolDefaultAction.ALLOW,
        },
        additionalAuthorizationModes: [
          {
            apiKeyDesc: API_KEY_DESCRIPTION,
          },
        ],
      },
      schemaDefinitionFile: './aws/schema.graphql',
    })
    /*******************
     * DynamoDb Tables *
     *******************/
    const tables: TableRecord = {} as TableRecord
    tables.users = new Dynamodb.Table(this, DDB_TABLES.users.id, {
      billingMode: Dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: Dynamodb.AttributeType.STRING,
      },
    })
    {
      /************
       * Mutation *
       ************/
      const mutationLambda = new Lambda.Function(this, LAMBDA.mutationLambda.name, {
        ...lambdaParams(LAMBDA.mutationLambda.name),
        timeout: CDK.Duration.seconds(5),
        memorySize: 256,
        environment: {
          USER_TABLE: tables.users.tableName,
          REGION: this.region,
        },
      })
      tables.users.grantReadWriteData(mutationLambda)
      const mutationDataSource = Graphql.addLambdaDataSource(
        LAMBDA.mutationLambda.dataSourceName,
        LAMBDA.mutationLambda.description,
        mutationLambda
      )
      // update
      createResolver('Mutation.updateUser', mutationDataSource)
      // create
      createResolver('Mutation.createUser', mutationDataSource)
    }
    {
      /*********
       * Query *
       *********/
      const queryLambda = new Lambda.Function(this, LAMBDA.queryLambda.name, {
        ...lambdaParams(LAMBDA.queryLambda.name),
        timeout: CDK.Duration.seconds(5),
        memorySize: 256,
        environment: {
          USER_TABLE: tables.users.tableName,
          REGION: this.region,
        },
      })
      tables.users.grantReadWriteData(queryLambda)
      const queryDataSource = Graphql.addLambdaDataSource(
        LAMBDA.queryLambda.dataSourceName,
        LAMBDA.queryLambda.description,
        queryLambda
      )
      createResolver('Query.User', queryDataSource)
    }
    /**********
     * Fields *
     **********/
    const fieldLambda = new Lambda.Function(this, LAMBDA.fieldLambda.name, {
      ...lambdaParams(LAMBDA.fieldLambda.name),
      environment: {
        USER_TABLE: tables.users.tableName,
      },
    })
    tables.users.grantReadData(fieldLambda)
    const fieldDataSource = Graphql.addLambdaDataSource(
      LAMBDA.fieldLambda.dataSourceName,
      LAMBDA.fieldLambda.description,
      fieldLambda
    )
    /***************
     * Field Array *
     ***************/
    const fieldArrayLambda = new Lambda.Function(this, LAMBDA.fieldArrayLambda.name, {
      ...lambdaParams(LAMBDA.fieldArrayLambda.name),
      environment: {
        USER_TABLE: tables.users.tableName,
      },
    })
    tables.users.grantReadData(fieldArrayLambda)
    const fieldArrayDataSource = Graphql.addLambdaDataSource(
      LAMBDA.fieldArrayLambda.dataSourceName,
      LAMBDA.fieldArrayLambda.description,
      fieldArrayLambda
    )
    /***********
     * Modules *
     ***********/
    userModule({
      stack: this,
      fieldDataSource,
      fieldArrayDataSource,
      graphql: Graphql,
      tables,
    })
    statusModule({
      stack: this,
      fieldDataSource,
      graphql: Graphql,
      tables,
    })
    /***********
     * Outputs *
     ***********/
    new CDK.CfnOutput(this, 'result', {
      description: 'Winning',
      value: `
        * Deployed *
        Mode: ${this.node.tryGetContext('mode')}
        Commit: ${this.node.tryGetContext('COMMIT_SHA')}
        `,
    })
  }
}

const App = new CDK.App({ autoSynth: true, context: {} })
new DevStack(App, 'StagingStack-1')
App.synth()
