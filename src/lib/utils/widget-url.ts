export function getWidgetUrl(widgetId: string): string {
  // Use production URL from environment variable, fallback to Vercel URL or localhost
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` :
                  'https://tiger.zoostack.com'
  
  return `${baseUrl}/widget/${widgetId}`
}

export function getWidgetPreviewUrl(widgetId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` :
                  'https://tiger.zoostack.com'
  
  return `${baseUrl}/widget/preview/${widgetId}`
}

export function getWidgetEmbedCode(widgetId: string): string {
  const widgetUrl = getWidgetUrl(widgetId)
  return `<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widgetId}"></div>
<script src="${widgetUrl}" async></script>`
}