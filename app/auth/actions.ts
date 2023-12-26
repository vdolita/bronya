"use server";

import { AuthCredential, authCredential } from "@/schemas";
import { TABLE_NAME, getDynamoDBClient } from "@/utils/dynamodb";
import { newSession } from "@/utils/session";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function Login(
  formData: AuthCredential
): Promise<{ error?: string } | undefined> {
  const cookieStore = cookies();

  // check if already logged in
  const cookieSsid = cookieStore.get("ssid");
  if (cookieSsid) {
    return redirect("/dashboard");
  }

  const credential = authCredential.safeParse(formData);
  if (!credential.success) {
    return { error: credential.error.issues[0].message };
  }

  const { username, password } = credential.data;
  let ssid: string;

  try {
    const user = await mustGetUser(username, password);
    ssid = await newSession(user.username);
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    } else {
      return { error: "Unknown error" };
    }
  }

  cookies().set("ssid", ssid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  redirect("/dashboard");
}

async function mustGetUser(username: string, pwd: string) {
  const dynamodbClient = getDynamoDBClient();
  const { Item } = await dynamodbClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: { S: `user#${username}` },
        sk: { S: `user` },
      },
    })
  );

  if (!Item) {
    throw new Error("User not found");
  }

  const hash = Item.password.S;
  const match = await bcrypt.compare(pwd, hash!);

  if (!match) {
    throw new Error("Invalid password");
  }

  return {
    username: Item.username.S!,
  };
}
