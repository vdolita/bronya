import { AppEncryptType } from "@/lib/meta";
import { ClientApp } from "@/lib/schemas/app";
import { App } from "@prisma/client";
import { AppUpdate } from "../adapter";
import { getPrismaClient } from "./prisma";

export async function findApp(name:string):Promise<ClientApp|null> {
    const pc = getPrismaClient();
    const app = await pc.app.findUnique({where:{name}});
    if (!app) {
        return null;
    }

    return dataToApp(app);
}

export async function allApps():Promise<ClientApp[]> {
    const pc = getPrismaClient();
    const apps = await pc.app.findMany();
    return apps.map(dataToApp);
}

export async function createApp(app:ClientApp) {
    const pc = getPrismaClient();
    await pc.app.create({data:app});
}

export async function saveApp(name: string, data: AppUpdate) {
    const pc = getPrismaClient();
    const newData = await pc.app.update({where:{name}, data});
    return dataToApp(newData);
}

function dataToApp(data: App): ClientApp {
    return {
        name: data.name,
        encryptType: data.encryptType as AppEncryptType,
        version: data.version,
        privateKey: data.privateKey,
        publicKey: data.publicKey,
    };
}