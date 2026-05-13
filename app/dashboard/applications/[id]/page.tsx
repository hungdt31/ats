import { ApplicationDetailView } from "./application-detail-view";

type Params = Promise<{ id: string }>;

export default async function ApplicationDetailPage(props: { params: Params }) {
  const { id } = await props.params;
  return <ApplicationDetailView applicationId={id} />;
}
