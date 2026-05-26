"use client"

import { useState } from "react"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MockScoreBadge } from "./mock-score-badge"
import { useDeleteMock } from "@/hooks/use-mocks"
import { Trash2, Clock, StickyNote } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { MockSession } from "@/lib/types"

const SECTION_KEYS = ["reasoning", "quant", "english", "ga"] as const
const SECTION_LABELS: Record<string, string> = {
  reasoning: "Reasoning", quant: "Quant", english: "English", ga: "GA",
}

interface Props { mocks: MockSession[] }

export function MockTable({ mocks }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { mutate: doDelete, isPending } = useDeleteMock()

  const confirmDelete = () => {
    if (!deleteId) return
    doDelete(deleteId, { onSettled: () => setDeleteId(null) })
  }

  if (!mocks.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
      <span className="text-3xl">📝</span>
      <p className="text-sm font-medium">No mock attempts yet</p>
      <p className="text-xs text-muted-foreground">
        Log your first mock test using the button above
      </p>
    </div>
  )

  return (
    <>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-28">Date</TableHead>
              <TableHead className="text-center">Total</TableHead>
              {SECTION_KEYS.map((k) => (
                <TableHead key={k} className="text-center">{SECTION_LABELS[k]}</TableHead>
              ))}
              <TableHead className="text-center w-20">Time</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {mocks.map((m) => {
              const ss = (m.sectionScores ?? {}) as Record<string, number>
              const total = m.totalScore ? parseFloat(m.totalScore) : null
              const isOptimistic = m.id.startsWith("optimistic-")

              return (
                <TableRow
                  key={m.id}
                  className={cn(
                    "group transition-colors",
                    isOptimistic && "opacity-60"
                  )}>

                  {/* Date */}
                  <TableCell className="font-medium text-sm">
                    <div className="flex flex-col gap-0.5">
                      <span>
                        {new Date(m.attemptedOn).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "2-digit",
                        })}
                      </span>
                      {m.notes && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 text-[10px]
                                           text-muted-foreground cursor-default">
                              <StickyNote className="h-2.5 w-2.5" /> note
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="max-w-xs text-xs whitespace-pre-wrap">
                            {m.notes}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>

                  {/* Total score */}
                  <TableCell className="text-center">
                    {total !== null
                      ? <MockScoreBadge score={total} maxScore={200} size="md" />
                      : <span className="text-muted-foreground/40 text-sm">—</span>
                    }
                  </TableCell>

                  {/* Per-section scores */}
                  {SECTION_KEYS.map((k) => (
                    <TableCell key={k} className="text-center">
                      {ss[k] !== undefined
                        ? <MockScoreBadge score={ss[k]} maxScore={50} />
                        : <span className="text-muted-foreground/30 text-xs">—</span>
                      }
                    </TableCell>
                  ))}

                  {/* Time taken */}
                  <TableCell className="text-center">
                    {m.timeTakenMins
                      ? <span className="flex items-center justify-center gap-1
                                       text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{m.timeTakenMins}m
                        </span>
                      : <span className="text-muted-foreground/30 text-xs">—</span>
                    }
                  </TableCell>

                  {/* Delete */}
                  <TableCell>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity
                                 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(m.id)}
                      disabled={isOptimistic}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this mock entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the mock attempt and its scores.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}