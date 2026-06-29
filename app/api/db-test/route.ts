import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        @@SERVERNAME AS serverName,
        DB_NAME() AS databaseName,
        GETDATE() AS serverTime
    `);

    return NextResponse.json({
      ok: true,
      data: result.recordset[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
