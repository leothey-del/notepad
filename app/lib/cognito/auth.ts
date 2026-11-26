"use client";

import {
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { COGNITO_CLIENT_ID, cognitoClient } from "./client";

export async function signInWithCognito(username: string, password: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });

  const response = await cognitoClient.send(command);

  if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    return {
      challengeName: response.ChallengeName,
      session: response.Session,
      username,
    };
  }

  return {
    idToken: response.AuthenticationResult?.IdToken,
    accessToken: response.AuthenticationResult?.AccessToken,
    refreshToken: response.AuthenticationResult?.RefreshToken,
  };
}

export async function completeNewPasswordChallenge(
  username: string,
  newPassword: string,
  session: string
) {
  const command = new RespondToAuthChallengeCommand({
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ClientId: COGNITO_CLIENT_ID,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
    },
  });

  const response = await cognitoClient.send(command);

  return {
    idToken: response.AuthenticationResult?.IdToken,
    accessToken: response.AuthenticationResult?.AccessToken,
    refreshToken: response.AuthenticationResult?.RefreshToken,
  };
}

export async function signUpWithCognito(
  username: string,
  email: string,
  password: string
) {
  const command = new SignUpCommand({
    ClientId: COGNITO_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  });

  return await cognitoClient.send(command);
}

export async function confirmSignUpWithCognito(username: string, code: string) {
  const command = new ConfirmSignUpCommand({
    ClientId: COGNITO_CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
  });

  return await cognitoClient.send(command);
}