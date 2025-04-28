import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol } from "@azure/storage-blob";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { base64Image, fileName, contentType } = await request.json();
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

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `${nanoid()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        const buffer = Buffer.from(base64Image, 'base64');
        await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
        const sasToken = await generateSasToken(accountName, accountKey, containerName, blobName);
        const imageUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
        return NextResponse.json({
            url: imageUrl,
            fileName: blobName
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    } catch (error: any) {
        if (error instanceof Error) {
            console.error("Error uploading to Azure Blob Storage:", error.message);
        }
        else if (error instanceof BlobServiceClient) {
            console.error("BlobServiceClient error:", error);
        }
        else if (error instanceof StorageSharedKeyCredential) {
            console.error("StorageSharedKeyCredential error:", error);
        }
        else if (error instanceof BlobSASPermissions) {
            console.error("BlobSASPermissions error:", error);
        }

        console.error("Error uploading to Azure Blob Storage:", error.message);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

}


export async function DELETE(request: Request) {
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

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        await blockBlobClient.deleteIfExists();
        return NextResponse.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting from Azure Blob Storage:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}

async function generateSasToken(accountName: string, accountKey: string, containerName: string, blobName: string) {
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
