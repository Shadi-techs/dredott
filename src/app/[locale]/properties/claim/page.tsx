import { redirect } from 'next/navigation'

export default async function ClaimRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { locale } = await params
  const sp = await searchParams
  const query = new URLSearchParams(sp).toString()
  redirect(`/${locale}/stays/claim${query ? `?${query}` : ''}`)
}
