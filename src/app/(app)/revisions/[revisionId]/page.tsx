import { RevisionWorkspace } from "@/features/revisions"

interface Props {
  params: Promise<{ revisionId: string }>
}

export default async function RevisionDetailPage({ params }: Props) {
  const { revisionId } = await params
  return <RevisionWorkspace problemId={revisionId} />
}

