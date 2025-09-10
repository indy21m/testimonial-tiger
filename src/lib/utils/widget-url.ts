export function getWidgetUrl(widgetId: string): string {
  // Use production URL from environment variable, fallback to custom domain
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://tiger.zoostack.com'

  return `${baseUrl}/widget/${widgetId}`
}

export function getWidgetPreviewUrl(widgetId: string): string {
  // Use production URL from environment variable, fallback to custom domain
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://tiger.zoostack.com'

  return `${baseUrl}/widget/preview/${widgetId}`
}

export function getWidgetEmbedCode(widgetId: string): string {
  const widgetUrl = getWidgetUrl(widgetId)
  return `<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widgetId}"></div>
<script src="${widgetUrl}" async></script>`
}
