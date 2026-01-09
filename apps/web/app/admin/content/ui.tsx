"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withCsrfHeaders } from "@/lib/security/csrf";

export function AdminContentClient() {
  const qc = useQueryClient();

  const flags = useQuery({
    queryKey: ["admin", "content", "flags"],
    queryFn: async () => {
      const res = await fetch("/api/admin/content/feature-flags", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.flags as Array<any>;
    },
  });

  const [flagKey, setFlagKey] = React.useState("");
  const [flagEnabled, setFlagEnabled] = React.useState(false);
  const saveFlag = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/content/feature-flags", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ key: flagKey, enabled: flagEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.flag;
    },
    onSuccess: async () => {
      setFlagKey("");
      setFlagEnabled(false);
      await qc.invalidateQueries({ queryKey: ["admin", "content", "flags"] });
    },
  });

  const announcements = useQuery({
    queryKey: ["admin", "content", "announcements"],
    queryFn: async () => {
      const res = await fetch("/api/admin/content/announcements", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.announcements as Array<any>;
    },
  });

  const [aTitle, setATitle] = React.useState("");
  const [aBody, setABody] = React.useState("");
  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/content/announcements", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ title: aTitle, body: aBody, active: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.announcement;
    },
    onSuccess: async () => {
      setATitle("");
      setABody("");
      await qc.invalidateQueries({ queryKey: ["admin", "content", "announcements"] });
    },
  });

  const plans = useQuery({
    queryKey: ["admin", "content", "plans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/content/pricing-plans", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.plans as Array<any>;
    },
  });

  const [planId, setPlanId] = React.useState("");
  const [planName, setPlanName] = React.useState("");
  const [planPrice, setPlanPrice] = React.useState("0");
  const [planLimit, setPlanLimit] = React.useState("0");
  const savePlan = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/content/pricing-plans", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          id: planId,
          name: planName || planId,
          priceCents: Number(planPrice),
          screenshotLimit: Number(planLimit),
          active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.plan;
    },
    onSuccess: async () => {
      setPlanId("");
      setPlanName("");
      setPlanPrice("0");
      setPlanLimit("0");
      await qc.invalidateQueries({ queryKey: ["admin", "content", "plans"] });
    },
  });

  const templates = useQuery({
    queryKey: ["admin", "content", "templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/content/email-templates", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.templates as Array<any>;
    },
  });

  const [tplSlug, setTplSlug] = React.useState("");
  const [tplSubject, setTplSubject] = React.useState("");
  const [tplBody, setTplBody] = React.useState("");
  const saveTemplate = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/content/email-templates", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ slug: tplSlug, subject: tplSubject, bodyText: tplBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.template;
    },
    onSuccess: async () => {
      setTplSlug("");
      setTplSubject("");
      setTplBody("");
      await qc.invalidateQueries({ queryKey: ["admin", "content", "templates"] });
    },
  });

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Feature flags</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="w-full">
            <label className="text-sm font-medium">Key</label>
            <Input value={flagKey} onChange={(e) => setFlagKey(e.target.value)} placeholder="flag_name" />
          </div>
          <Button variant="outline" onClick={() => setFlagEnabled((v) => !v)}>
            {flagEnabled ? "Enabled" : "Disabled"}
          </Button>
          <Button onClick={() => saveFlag.mutate()} disabled={saveFlag.isPending || !flagKey}>
            Save
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {flags.isLoading ? "Loading…" : flags.data?.map((f) => `${f.key}=${f.enabled}`).join(" • ") || "No flags"}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Announcements</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="Title" />
          <Input value={aBody} onChange={(e) => setABody(e.target.value)} placeholder="Body" />
        </div>
        <Button onClick={() => createAnnouncement.mutate()} disabled={createAnnouncement.isPending || !aTitle || !aBody}>
          Create
        </Button>
        <div className="text-sm text-muted-foreground">
          {announcements.data?.length ? `${announcements.data.length} announcements` : "No announcements"}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Pricing plans</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input value={planId} onChange={(e) => setPlanId(e.target.value)} placeholder="id (free/pro)" />
          <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="name" />
          <Input value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} placeholder="priceCents" />
          <Input value={planLimit} onChange={(e) => setPlanLimit(e.target.value)} placeholder="screenshotLimit" />
        </div>
        <Button onClick={() => savePlan.mutate()} disabled={savePlan.isPending || !planId}>
          Save plan
        </Button>
        <div className="text-sm text-muted-foreground">
          {plans.data?.length ? plans.data.map((p) => `${p.id}($${(p.priceCents / 100).toFixed(2)}):${p.screenshotLimit}`).join(" • ") : "No plans"}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Email templates</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input value={tplSlug} onChange={(e) => setTplSlug(e.target.value)} placeholder="slug" />
          <Input value={tplSubject} onChange={(e) => setTplSubject(e.target.value)} placeholder="subject" />
          <Input value={tplBody} onChange={(e) => setTplBody(e.target.value)} placeholder="body text" />
        </div>
        <Button onClick={() => saveTemplate.mutate()} disabled={saveTemplate.isPending || !tplSlug}>
          Save template
        </Button>
        <div className="text-sm text-muted-foreground">
          {templates.data?.length ? templates.data.map((t) => t.slug).join(" • ") : "No templates"}
        </div>
      </section>
    </div>
  );
}

