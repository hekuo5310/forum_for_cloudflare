export interface S3Env {
    IMAGES: R2Bucket;
    PUBLIC_BUCKET_URL?: string;
}

export async function uploadImage(env: S3Env, file: File, userId: string | number, postId: string | number = 'general', type: 'post' | 'avatar' = 'post'): Promise<string> {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const key = type === 'avatar'
        ? `usr/${userId}/avatar/${filename}`
        : `usr/${userId}/post/${postId}/${filename}`;

    await env.IMAGES.put(key, file, {
        httpMetadata: {
            contentType: file.type || 'application/octet-stream',
        }
    });

    return env.PUBLIC_BUCKET_URL
        ? `${env.PUBLIC_BUCKET_URL}/${key}`
        : `https://images.example.com/${key}`;
}

export async function deleteImage(env: S3Env, imageUrl: string, expectedOwnerId?: string | number): Promise<boolean> {
    const key = imageUrl.split('/').slice(-4).join('/');

    if (expectedOwnerId && !key.includes(`usr/${expectedOwnerId}/`)) {
        console.error(`[Security] Blocked unauthorized deletion: ${key}`);
        return false;
    }

    await env.IMAGES.delete(key);
    return true;
}

export async function listAllKeys(env: S3Env): Promise<string[]> {
    const keys: string[] = [];
    const listed = await env.IMAGES.list();

    for (const obj of listed.objects) {
        keys.push(obj.key);
    }

    return keys;
}

export function getPublicUrl(env: S3Env, key: string): string {
    return env.PUBLIC_BUCKET_URL
        ? `${env.PUBLIC_BUCKET_URL}/${key}`
        : `https://images.example.com/${key}`;
}
