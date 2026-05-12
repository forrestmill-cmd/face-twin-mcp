#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const BASE_URLS = {
    prank: "https://prankmyface.lol",
    privacy: "https://pleasejuststop.org",
};
async function postJson(url, origin, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: origin,
            Referer: `${origin}/`,
            "User-Agent": "face-twin-mcp/0.1 (+https://pleasejuststop.org)",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = (await response.json());
    if (!response.ok) {
        throw new Error(payload.error || `HTTP ${response.status}`);
    }
    return payload;
}
async function getJson(url, origin) {
    const response = await fetch(url, {
        headers: {
            Origin: origin,
            Referer: `${origin}/`,
            "User-Agent": "face-twin-mcp/0.1 (+https://pleasejuststop.org)",
        },
    });
    const payload = (await response.json());
    if (!response.ok) {
        throw new Error(payload.error || `HTTP ${response.status}`);
    }
    return payload;
}
async function createPrank(imageUrl, framing, waitForReady) {
    const baseUrl = BASE_URLS[framing];
    const upload = await postJson(`${baseUrl}/api/upload`, baseUrl, {
        url: imageUrl,
    });
    let status = { status: upload.status };
    if (waitForReady) {
        await postJson(`${baseUrl}/api/prank/${upload.slug}/generate`, baseUrl);
        const deadline = Date.now() + 120_000;
        while (Date.now() < deadline) {
            status = await getJson(`${baseUrl}/api/prank/${upload.slug}/status`, baseUrl);
            if (status.status === "ready" || status.status === "error")
                break;
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
    return {
        framing,
        senderUrl: baseUrl,
        slug: upload.slug,
        victimLink: upload.link,
        status: status.status,
        imagesReady: status.status === "ready",
        generatedImages: status.images || [],
        notes: [
            "Prank My Face and FaceTwin are honest sender framings.",
            "Do not present facetwinfinder.com as a real biometric search product.",
            "Use only for prank flows where the reveal is part of the experience.",
        ],
    };
}
const server = new McpServer({
    name: "face-twin-mcp",
    version: "0.1.0",
});
server.tool("create_face_twin_prank", "Create a FaceTwin / Prank My Face AI doppelganger prank link from a public image URL.", {
    imageUrl: z.string().url().describe("Direct public URL to a photo image."),
    framing: z
        .enum(["prank", "privacy"])
        .default("prank")
        .describe("Use prankmyface.lol for prank framing or pleasejuststop.org for privacy-art framing."),
    waitForReady: z
        .boolean()
        .default(false)
        .describe("If true, trigger generation and poll until ready or timeout."),
}, async ({ imageUrl, framing, waitForReady }) => {
    const result = await createPrank(imageUrl, framing, waitForReady);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
const transport = new StdioServerTransport();
await server.connect(transport);
