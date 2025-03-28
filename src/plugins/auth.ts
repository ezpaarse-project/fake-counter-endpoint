import type { preValidationHookHandler } from 'fastify';

import { exceptions } from '~/models/r5/exceptions';

/**
 * Setup a pre-validation hook that checks if a Customer ID key is provided and valid
 *
 * @param valid Which values are valid
 */
export function requireCustomerId(valid: string[] = ['0000']): preValidationHookHandler {
  return async (request, reply) => {
    const id = (request.query as { customer_id?: string })?.customer_id;

    if (!id) {
      const { status, ...exception } = exceptions.notEnoughInformation;
      reply.status(status);
      reply.send(exception);
      return;
    }

    if (!valid.includes(id)) {
      const { status, ...exception } = exceptions.customerNotAuthorized;
      reply.status(status);
      reply.send(exception);
    }
  };
}

/**
 * Setup a pre-validation hook that checks if a Requestor ID is provided and valid
 *
 * @param valid Which values are valid
 */
export function requireRequestorId(valid: string[] = ['0000']): preValidationHookHandler {
  return async (request, reply) => {
    const id = (request.query as { requestor_id?: string })?.requestor_id;

    if (!id) {
      const { status, ...exception } = exceptions.notEnoughInformation;
      reply.status(status);
      reply.send(exception);
      return;
    }

    if (!valid.includes(id)) {
      const { status, ...exception } = exceptions.requestorNotAuthorized;
      reply.status(status);
      reply.send(exception);
    }
  };
}

/**
 * Setup a pre-validation hook that checks if an API key is provided and valid
 *
 * @param valid Which values are valid
 */
export function requireAPIKey(valid: string[] = ['0000']): preValidationHookHandler {
  return async (request, reply) => {
    const key = (request.query as { api_key?: string })?.api_key;

    if (!key) {
      const { status, ...exception } = exceptions.notEnoughInformation;
      reply.status(status);
      reply.send(exception);
      return;
    }

    if (!valid.includes(key)) {
      const { status, ...exception } = exceptions.apiNotAuthorized;
      reply.status(status);
      reply.send(exception);
    }
  };
}
