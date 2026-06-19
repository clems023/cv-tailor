"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export interface ApplicationSummary {
  id: string;
  company: string;
  jobTitle: string;
  createdAt: string;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function ApplicationHistory() {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      try {
        const response = await fetch("/api/applications");
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.error ?? "Erreur de chargement.");
        }

        setApplications(data);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur inconnue.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Historique</CardTitle>
        <CardDescription>Vos candidatures passées</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && applications.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucune candidature pour le moment.
          </p>
        )}
        {!loading && !error && applications.length > 0 && (
          <ScrollArea className="h-[calc(100vh-220px)] pr-3">
            <ul className="space-y-3">
              {applications.map((app, index) => (
                <li key={app.id}>
                  <Link
                    href={`/applications/${app.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{app.jobTitle}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {app.company}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {formatDate(app.createdAt)}
                      </Badge>
                    </div>
                  </Link>
                  {index < applications.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
