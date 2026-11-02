import { ProblemForm } from "@/features/problems"

interface Props {
  params: Promise<{ problemId: string }>
}

export default async function EditProblemPage({ params }: Props) {
  const { problemId } = await params
  return <ProblemForm problemId={problemId} isEdit />
}

