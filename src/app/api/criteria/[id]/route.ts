import { NextResponse } from "next/server";
import { getCompany, updateSweepCriteria } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompany(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json(company.sweep_criteria_json);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompany(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const { sources, focus } = body;

    if (!Array.isArray(sources) || !Array.isArray(focus)) {
      return NextResponse.json(
        { error: "sources and focus must be arrays" },
        { status: 400 }
      );
    }

    await updateSweepCriteria(id, { sources, focus });

    return NextResponse.json({ success: true, sources, focus });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
