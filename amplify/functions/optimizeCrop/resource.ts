import { defineFunction } from '@aws-amplify/backend';

export const optimizeCropFunction = defineFunction({
  entry: './handler.ts',
  name: 'optimizeCropFunction',
});
