import { ProblemDetails } from "@/features/problems"

interface Props {
  params: Promise<{ problemId: string }>
}

export default async function ProblemDetailPage({ params }: Props) {
  const { problemId } = await params

  return <ProblemDetails problemId={problemId} />
}
