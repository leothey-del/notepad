"use client";

import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

export const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION!,
});