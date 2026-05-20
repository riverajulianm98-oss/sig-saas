'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ComplianceScoreProps {
  score: number | null
  loading?: boolean
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold" style={{ color }}>
          {score}%
        </p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">compliance</p>
      </div>
    </div>
  )
}

export function ComplianceScore({ score, loading }: ComplianceScoreProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-28 w-28 rounded-full" />
        </CardContent>
      </Card>
    )
  }

  const label =
    score === null
      ? 'Sin datos'
      : score >= 80
        ? 'Excelente'
        : score >= 60
          ? 'Aceptable'
          : score >= 40
            ? 'Por mejorar'
            : 'Crítico'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Score de Compliance Global
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        {score !== null ? (
          <>
            <ScoreRing score={score} />
            <p
              className={cn(
                'text-sm font-semibold',
                score >= 80
                  ? 'text-emerald-500'
                  : score >= 60
                    ? 'text-amber-500'
                    : 'text-red-500'
              )}
            >
              {label}
            </p>
          </>
        ) : (
          <div className="flex h-28 items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
            Sin auditorías finalizadas
          </div>
        )}
      </CardContent>
    </Card>
  )
}
