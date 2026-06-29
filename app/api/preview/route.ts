import { NextResponse } from "next/server";
import { parseCheckExcel } from "@/lib/excel";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    const rows = await parseCheckExcel(file);
    console.log(JSON.stringify(rows[0], null, 2));
    return NextResponse.json({
      ok: true,
      total: rows.length,
      rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
}
