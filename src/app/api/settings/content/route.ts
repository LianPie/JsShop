import { NextResponse } from "next/server";
import { readFile, writeFile, rename } from "fs/promises";
import { CONTENT_PATH } from "@/lib/site-files";
import { getCurrentUser } from "@/lib/session";

function sameShape(a: unknown, b: unknown): boolean {
  if (a === null) return b === null;
  if (Array.isArray(a)) {
    return Array.isArray(b) && a.length === b.length && a.every((v, i) => sameShape(v, b[i]));
  }
  if (typeof a === "object") {
    if (b === null || typeof b !== "object" || Array.isArray(b)) return false;
    const ak = Object.keys(a as object);
    const bk = Object.keys(b as object);
    return (
      ak.length === bk.length &&
      ak.every(
        (k) =>
          k in (b as object) &&
          sameShape((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
      )
    );
  }
  return typeof a === typeof b;
}

export async function GET() {
  const user = await getCurrentUser("admin");
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await readFile(CONTENT_PATH, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    console.error("Error reading site content:", error);
    return NextResponse.json({ message: "Failed to read content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser("admin");
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  try {
    const current = JSON.parse(await readFile(CONTENT_PATH, "utf8"));

    if (!sameShape(current, incoming)) {
      return NextResponse.json(
        { message: "Content structure doesn't match the existing file" },
        { status: 400 }
      );
    }

    // Write to a temp file first so a crash can't leave a half-written JSON file
    const tmp = `${CONTENT_PATH}.tmp`;
    await writeFile(tmp, JSON.stringify(incoming, null, 2) + "\n", "utf8");
    await rename(tmp, CONTENT_PATH);

    return NextResponse.json({ message: "Content saved" }, { status: 200 });
  } catch (error) {
    console.error("Error saving site content:", error);
    return NextResponse.json({ message: "Failed to save content" }, { status: 500 });
  }
}