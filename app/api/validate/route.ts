import { NextResponse } from "next/server";
import { validateCheckRows } from "@/services/validation.service";
import { CheckExcelRow } from "@/types/excel";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firm = String(body.firm || "760");
    const rows = body.rows as CheckExcelRow[];

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { ok: false, message: "Satır verisi geçersiz" },
        { status: 400 }
      );
    }

    const result = await validateCheckRows(firm, rows);

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
