import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const supabase = getSupabase();

  const { data: activities, error: aErr } = await supabase
    .from("activities")
    .select("*")
    .eq("date", date)
    .order("duration_sec", { ascending: false });

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  let zones: { activity_id: string; zone: number; seconds: number; percentage: number }[] = [];
  if (activities && activities.length > 0) {
    const ids = activities.map((a) => a.id);
    const { data: zoneData } = await supabase
      .from("hr_zones")
      .select("activity_id,zone,seconds,percentage")
      .in("activity_id", ids);
    zones = zoneData ?? [];
  }

  return NextResponse.json({ activities: activities ?? [], zones });
}
