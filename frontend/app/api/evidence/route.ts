import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { recordAuditEvent } from "../../../lib/audit";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const incidentId = formData.get("incidentId");

    if (incidentId !== null && incidentId !== "") {
      if (
        typeof incidentId !== "string" ||
        !/^CFA-[A-F0-9]{8}$/.test(incidentId)
      ) {
        return NextResponse.json(
          { error: "Invalid incident ID" },
          { status: 400 }
        );
      }

      const incidentPath = path.join(
        process.cwd(),
        "private_incidents",
        "incidents",
        `${incidentId}.json`
      );

      try {
        await readFile(incidentPath, "utf8");
      } catch {
        return NextResponse.json(
          { error: "Selected incident was not found" },
          { status: 404 }
        );
      }
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be between 1 byte and 10 MB" },
        { status: 400 }
      );
    }

    const allowedTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
    };

    const extension = path.extname(file.name).toLowerCase();
    const expectedType = allowedTypes[extension];

    if (!expectedType || file.type !== expectedType) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const id = randomUUID();

    const baseDirectory = path.join(process.cwd(), "private_evidence");
    const filesDirectory = path.join(baseDirectory, "files");
    const metadataDirectory = path.join(baseDirectory, "metadata");

    await mkdir(filesDirectory, { recursive: true });
    await mkdir(metadataDirectory, { recursive: true });

    await writeFile(path.join(filesDirectory, `${id}${extension}`), buffer);

    const metadata = {
      id,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      sha256,
      uploadedAt: new Date().toISOString(),
      status: "UPLOADED",
      incidentId: incidentId || null,
    };

    await writeFile(
      path.join(metadataDirectory, `${id}.json`),
      JSON.stringify(metadata, null, 2),
      "utf8"
    );

    await recordAuditEvent({
      evidenceId: id,
      event: "UPLOAD",
      result: "SUCCESS",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(metadata, { status: 201 });
  } catch (error) {
    console.error("Evidence upload failed:", error);
    return NextResponse.json(
      { error: "Evidence upload failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const metadataDirectory = path.join(
      process.cwd(),
      "private_evidence",
      "metadata"
    );

    const filenames = await readdir(metadataDirectory);

    const records = await Promise.all(
      filenames
        .filter((name) => name.endsWith(".json"))
        .map(async (name) => {
          try {
            const content = await readFile(
              path.join(metadataDirectory, name),
              "utf8"
            );
            return JSON.parse(content);
          } catch {
            return null;
          }
        })
    );

    const evidence = records
      .filter((record) => record !== null)
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() -
          new Date(a.uploadedAt).getTime()
      );

    return NextResponse.json({
      totalEvidence: evidence.length,
      evidence,
    });
  } catch {
    return NextResponse.json({
      totalEvidence: 0,
      evidence: [],
    });
  }
}

