"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import type { CreateLeadDto } from "../../../../../packages/contracts/src/lead";

type AppointmentDraft = Omit<CreateLeadDto, "source">;

const INITIAL_FORM: AppointmentDraft = {
  contactName: "",
  phone: "",
  serviceType: "yuesao",
  expectedTime: "",
  address: "",
  remark: "",
};

export function AppointmentForm() {
  const [form, setForm] = useState<AppointmentDraft>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({
      type: "idle",
      message: "",
    });

    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          source: "website",
        } satisfies CreateLeadDto),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "提交失败，请稍后重试。");
      }

      setForm(INITIAL_FORM);
      setFeedback({
        type: "success",
        message: payload?.message || "预约已提交，顾问会尽快联系你。",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "提交失败，请稍后重试。",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <aside className="appointment-card">
      <div className="appointment-card__heading">
        <span className="hero__eyebrow">在线预约</span>
        <h2>提交需求，顾问尽快回电</h2>
        <p>字段先保持精简，先把留资闭环跑通，再逐步补后台跟进能力。</p>
      </div>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>联系人</span>
          <input
            name="contactName"
            placeholder="请输入姓名"
            required
            value={form.contactName}
            onChange={handleChange}
          />
        </label>

        <label className="form-field">
          <span>手机号</span>
          <input
            name="phone"
            placeholder="请输入手机号"
            required
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label className="form-field">
          <span>服务类型</span>
          <select name="serviceType" value={form.serviceType} onChange={handleChange}>
            <option value="yuesao">月嫂服务</option>
            <option value="cleaning">保洁服务</option>
            <option value="care">家庭照护</option>
          </select>
        </label>

        <label className="form-field">
          <span>期望时间</span>
          <input
            name="expectedTime"
            type="datetime-local"
            value={form.expectedTime || ""}
            onChange={handleChange}
          />
        </label>

        <label className="form-field">
          <span>服务地址</span>
          <input
            name="address"
            placeholder="可选，方便顾问评估服务范围"
            value={form.address || ""}
            onChange={handleChange}
          />
        </label>

        <label className="form-field">
          <span>补充说明</span>
          <textarea
            name="remark"
            placeholder="可选，填写家庭情况或服务重点"
            rows={4}
            value={form.remark || ""}
            onChange={handleChange}
          />
        </label>

        <button className="button-primary appointment-form__submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "提交中..." : "提交预约"}
        </button>

        {feedback.type !== "idle" ? (
          <p
            aria-live="polite"
            className={`form-feedback form-feedback--${feedback.type}`}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}
      </form>
    </aside>
  );
}
