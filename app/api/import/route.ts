import { NextResponse } from "next/server";
import { importChecks } from "@/services/import.service";
import { ValidatedCheckRow } from "@/types/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firm = String(body.firm || "760");
    const period = String(body.period || "01");
    const rows = body.rows as ValidatedCheckRow[];

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { ok: false, message: "Satır verisi geçersiz." },
        { status: 400 }
      );
    }

    const result = await importChecks(firm, period, rows);

    return NextResponse.json({
      ok: true,
      message: `${result.total} kayıt başarıyla aktarıldı.`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
}
