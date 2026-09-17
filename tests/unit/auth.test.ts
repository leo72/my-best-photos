import {
  describe,
  expect,
  it,
} from 'vitest';

import { getSignedInPath } from '../../src/features/auth/signed-in-path';

describe('getSignedInPath', () => {
  it('sends verified users to My Photos', () => {
    expect(getSignedInPath({
      id: 'owner',
      email: 'owner@example.com',
      emailVerified: true,
    })).toBe('/photos');
  });

  it('sends unverified users to email confirmation', () => {
    expect(getSignedInPath({
      id: 'owner',
      email: 'owner@example.com',
      emailVerified: false,
    })).toBe('/verify-email');
  });
});
