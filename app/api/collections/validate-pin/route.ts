import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Collection } from "@/lib/models/Collection";
import { pinValidationSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = pinValidationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const collection = await Collection.findOne({ slug: parsed.data.slug });
    if (!collection) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (collection.visibility !== "PIN" || !collection.pinHash) {
      return NextResponse.json({ valid: true });
    }

    const valid = await bcrypt.compare(parsed.data.pin, collection.pinHash);
    if (!valid) {
      return NextResponse.json(
        { valid: false, error: "Invalid PIN" },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("PIN validation error:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
