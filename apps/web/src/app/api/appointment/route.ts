import { NextResponse } from "next/server";
import type { CreateLeadDto } from "../../../../../../packages/contracts/src/lead";

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3200";

function normalizeExpectedTime(expectedTime?: string) {
  if (!expectedTime?.trim()) {
    return "";
  }

  const parsed = new Date(expectedTime);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

export async function POST(request: Request) {
  let payload: CreateLeadDto;

  try {
    payload = (await request.json()) as CreateLeadDto;
  } catch {
    return NextResponse.json(
      {
        message: "请求格式不正确。",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/public/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        source: "website",
        expectedTime: normalizeExpectedTime(payload.expectedTime),
      } satisfies CreateLeadDto),
    });

    const data = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!response.ok) {
      return NextResponse.json(
        data || {
          message: "预约提交失败，请稍后重试。",
        },
        {
          status: response.status,
        },
      );
    }

    return NextResponse.json(
      {
        message: "预约已提交，顾问会尽快联系你。",
        lead: data,
      },
      {
        status: 201,
      },
    );
  } catch {
    return NextResponse.json(
      {
        message: "预约服务暂时不可用，请稍后重试。",
      },
      {
        status: 502,
      },
    );
  }
}
