import { NextResponse } from "next/server";
import { simulateCheckImport } from "@/services/simulation.service";
import { ValidatedCheckRow } from "@/types/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firm = String(body.firm || "760");
    const rows = body.rows as ValidatedCheckRow[];

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { ok: false, message: "Satır verisi geçersiz" },
        { status: 400 }
      );
    }

    const validCount = rows.filter((row) => row.isValid).length;
    if (validCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Simülasyon için geçerli satır bulunamadı" },
        { status: 400 }
      );
    }

    const result = await simulateCheckImport(firm, rows);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
}
