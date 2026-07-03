import { redirect } from "next/navigation";

interface SearchParams {
  id?: string;
}

export default async function VerifyRedirectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const id = params.id?.trim();

  if (id) {
    redirect(`/verify/${id}`);
  }

  // If no ID is provided, redirect back to home page
  redirect("/");
}
