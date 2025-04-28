// app/api/generate-sas/route.ts
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import {  StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol } from "@azure/storage-blob";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { fileName } = await request.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    if (!accountName || !accountKey || !containerName) {
        return NextResponse.json({ error: "Missing Azure Storage configuration" }, { status: 500 });
    }

    // Generate a unique blob name
    const blobName = `${nanoid()}-${fileName}`;
    
    try {
        const sasToken = generateUploadSasToken(accountName, accountKey, containerName, blobName);
        const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
        
        return NextResponse.json({
            uploadUrl,
            blobName,
            readUrl: `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${generateReadSasToken(accountName, accountKey, containerName, blobName)}`
        });
    } catch (error) {
        console.error("Error generating SAS token:", error);
        return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }
}

function generateUploadSasToken(accountName: string, accountKey: string, containerName: string, blobName: string) {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("cw"), // create and write permissions
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 15 * 60 * 1000), // 15 minutes from now
        protocol: SASProtocol.Https,
    }, sharedKeyCredential).toString();

    return sasToken;
}

function generateReadSasToken(accountName: string, accountKey: string, containerName: string, blobName: string) {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"), // read permission
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        protocol: SASProtocol.Https,
    }, sharedKeyCredential).toString();

    return sasToken;
}