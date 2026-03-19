import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { optimizeCropFunction } from './functions/optimizeCrop/resource';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  optimizeCropFunction
});

// AWS AGENTCORE: Provisioning Syngenta Agent via CDK Amplify
const agentRole = new iam.Role(backend.data.resources.graphqlApi, 'SyngentaAgentRole', {
  assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com')
});

const marsAgent = new bedrock.CfnAgent(backend.data.resources.graphqlApi, 'MarsFarmAgentCore', {
  agentName: 'Syngenta-AgentCore-MarsFarm',
  foundationModel: 'anthropic.claude-3-haiku-20240307-v1:0',
  instruction: 'You are ARES, the Syngenta AgentCore instance for a Martian Greenhouse. Calculate optimal Lettuce and Potato settings based on the Knowledge Base.',
  agentResourceRoleArn: agentRole.roleArn
});

backend.optimizeCropFunction.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['bedrock:InvokeModel', 'bedrock:InvokeAgent'],
    resources: ['*']
  })
);
