import { redirect } from 'next/navigation'

export default async function PropertyRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  redirect(`/${locale}/stays/${slug}`)
}
