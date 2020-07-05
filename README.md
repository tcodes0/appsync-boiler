# AppSync Boilerplate using CDK

See the video for detailed code explanations and QA with community: https://www.youtube.com/watch?v=1Y3pQUkpqQ0

## Usage

After having an aws account setup and `aws cli` installed, run `yarn deploy`
It will deploy a basic AppSync server for you using lambda resolvers.


## cdk bootstrap

You may encounter an error while deploying about running `cdk bootstrap`

Run it like this:
`yarn cdk bootstrap aws://9999999999/us-east-2 --profile <profile here if using>`

[go to the dashboard to find you account id](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html)
Replace 9999999999 with it.
Replace `us-east-2` with the region you're using, this is visible on the dashboard.
If using a profile (only if you deploy to multiple aws account) pass profile name after `--profile`

## credentials

It's useful to know aws stores your credentials at `~/.aws/credentials`

use `cat ~/.aws/credentials` to see them

## field lambdas

`_fieldLambda` resolves a model id within another model.
Imagine you're liking a post in a social network:
```js
// like model
{
  user: 2382adabc7323bcf
  post: badf738c373bcf
}
```

Since both strigs are ids to other models, you'd create a resolver using `_fieldLambda` in the `Like` module
```js
// modules/like
createResolver('Like.user', _fieldLambda)
createResolver('Like.post', _fieldLambda)
```

`_fieldArrayLambda` resolves a model id array within another model.
Imagine you're saving a users email address, and that `email` is a model
```js
// user model
{
  emails: [2382adabc7323bcf, badf738c373bcf]
}
```

Since both strigs are ids to other models, you'd create a resolver using `_fieldLambda` in the `Like` module
```js
// modules/user
createResolver('User.emails', _fieldArrayLambda)
```