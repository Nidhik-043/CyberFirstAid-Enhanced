import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";

const incidentDirectory = path.join(
  process.cwd(),
  "private_incidents",
  "incidents"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const allowedTypes = [
      "financial_fraud",
      "account_hacking",
      "phishing",
      "identity_theft",
      "harassment",
      "lost_device",
      "other",
    ];

    if (!allowedTypes.includes(body.incidentType)) {
      return NextResponse.json(
        { error: "Invalid incident type" },
        { status: 400 }
      );
    }

    if (
      typeof body.description !== "string" ||
      !body.description.trim() ||
      body.description.length > 2000
    ) {
      return NextResponse.json(
        { error: "Description is required and must be under 2000 characters" },
        { status: 400 }
      );
    }

    if (
      typeof body.incidentDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.incidentDate) ||
      !Number.isFinite(Date.parse(body.incidentDate))
    ) {
      return NextResponse.json(
        { error: "A valid incident date is required" },
        { status: 400 }
      );
    }

    if (!["yes", "no", "unsure"].includes(body.isOngoing)) {
      return NextResponse.json(
        { error: "Invalid ongoing status" },
        { status: 400 }
      );
    }

    await mkdir(incidentDirectory, { recursive: true });

    const id = `CFA-${randomUUID().slice(0, 8).toUpperCase()}`;

    const incident = {
      id,
      incidentType: body.incidentType,
      description: body.description.trim(),
      incidentDate: body.incidentDate,
      isOngoing: body.isOngoing,
      createdAt: new Date().toISOString(),
      status: "OPEN",
    };

    await writeFile(
      path.join(incidentDirectory, `${id}.json`),
      JSON.stringify(incident, null, 2),
      { encoding: "utf8", flag: "wx" }
    );

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error("Incident creation failed:", error);

    return NextResponse.json(
      { error: "Unable to save incident" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await mkdir(incidentDirectory, { recursive: true });

    const filenames = await readdir(incidentDirectory);

    const records = await Promise.all(
      filenames
        .filter((name) => name.endsWith(".json"))
        .map(async (name) => {
          try {
            const content = await readFile(
              path.join(incidentDirectory, name),
              "utf8"
            );
            return JSON.parse(content);
          } catch {
            return null;
          }
        })
    );

    const incidents = records
      .filter((record) => record !== null)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

    return NextResponse.json({
      totalIncidents: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Incident retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve incidents" },
      { status: 500 }
    );
  }
}
