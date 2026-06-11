import { redirect } from 'next/navigation'

export default async function PropertiesRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { locale } = await params
  const sp = await searchParams
  const query = new URLSearchParams(sp).toString()
  redirect(`/${locale}/stays${query ? `?${query}` : ''}`)
}
