# face-twin-mcp

MCP server for creating FaceTwin / Prank My Face AI doppelganger prank links.

FaceTwin has two honest public framings:

- Privacy-art project: https://pleasejuststop.org
- Prank tool: https://prankmyface.lol

The victim-facing `facetwinfinder.com` URLs are ephemeral result pages. Do not list them as a real AI identity-search product.

## Install

```bash
npx -y github:forrestmill-cmd/face-twin-mcp
```

Claude Desktop / Claude Code MCP config:

```json
{
  "mcpServers": {
    "face-twin": {
      "command": "npx",
      "args": ["-y", "github:forrestmill-cmd/face-twin-mcp"]
    }
  }
}
```

The npm package name `face-twin-mcp` is reserved in this repo, but the first npm publish is blocked until the account's 2FA OTP is supplied.

## Tool

### `create_face_twin_prank`

Creates a prank session from a public image URL and optionally waits for image generation to finish.

Inputs:

- `imageUrl` - direct public image URL
- `framing` - `prank` or `privacy`
- `waitForReady` - optional boolean; if true, the tool triggers generation and polls briefly

Output includes the sender URL, generated victim link, slug, status, and safety notes.

## Safety

Use this for friend-to-friend prank links with a reveal. Do not use it for impersonation, harassment, or claiming that the generated images are real people from a biometric database.
