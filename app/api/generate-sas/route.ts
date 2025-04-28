import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol } from "@azure/storage-blob";
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
        console.error("Missing Azure Storage configuration: ", { accountName, accountKey, containerName });
        return NextResponse.json({ error: "Missing Azure Storage configuration" }, { status: 500 });
    }

    const blobName = `${nanoid()}-${fileName}`;

    try {
        const uploadSasToken = generateUploadSasToken(accountName, accountKey, containerName, blobName);
        const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${uploadSasToken}`;

        const readSasToken = generateReadSasToken(accountName, accountKey, containerName, blobName);
        const readUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${readSasToken}`;

        return NextResponse.json({
            uploadUrl,
            blobName,
            readUrl
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error generating SAS token:", error);
        if (error instanceof Error) {
            console.error("Error generating SAS token:", error.message);
        } else if (error instanceof StorageSharedKeyCredential) {
            console.error("StorageSharedKeyCredential error:", error);
        } else if (error instanceof BlobSASPermissions) {
            console.error("BlobSASPermissions error:", error);
        }
        return NextResponse.json({ error: `Failed to generate upload URL: ${error.message}` }, { status: 500 });
    }
}

function generateUploadSasToken(accountName: string, accountKey: string, containerName: string, blobName: string) {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("cw"), // Create and Write permissions
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 15 * 60 * 1000), // 15 minutes expiration time
        protocol: SASProtocol.Https,
    }, sharedKeyCredential).toString();

    return sasToken;
}

function generateReadSasToken(accountName: string, accountKey: string, containerName: string, blobName: string) {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"), // Read permission
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 30 * 24 * 60 * 60 * 1000), // 30 days expiration time
        protocol: SASProtocol.Https,
    }, sharedKeyCredential).toString();

    return sasToken;
}
