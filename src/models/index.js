// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Permission = {
  "READ": "READ",
  "WRITE": "WRITE"
};

const { Document, Share } = initSchema(schema);

export {
  Document,
  Share,
  Permission
};