import { notFound, redirect } from "next/navigation";
import { BookingWizard } from "@/components/booking-wizard";
import { isMeetingType, meetings } from "@/lib/meetings";

export default async function BookPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;

  if (!params.type) {
    redirect("/");
  }

  if (!isMeetingType(params.type)) {
    notFound();
  }

  return <BookingWizard meeting={meetings[params.type]} />;
}
