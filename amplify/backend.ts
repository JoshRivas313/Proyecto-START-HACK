import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { optimizeCropFunction } from './functions/optimizeCrop/resource';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  optimizeCropFunction
});

backend.optimizeCropFunction.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0']
  })
);
