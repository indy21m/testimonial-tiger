import { db, integrations, webhookLogs } from '@/server/db'
import { eq, and } from 'drizzle-orm'

interface WebhookPayload {
  event: string
  timestamp: string
  data: any
}

export async function triggerWebhooks(
  userId: string,
  event: 'new_testimonial' | 'approved' | 'featured',
  data: any
) {
  try {
    // Get active integrations for this user with matching triggers
    const userIntegrations = await db.query.integrations.findMany({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.isActive, true)
      ),
    })

    // Filter integrations that have this trigger enabled
    const relevantIntegrations = userIntegrations.filter((integration) =>
      integration.config.triggers?.includes(event)
    )

    if (relevantIntegrations.length === 0) {
      return
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    // Send webhooks in parallel with timeout
    const webhookPromises = relevantIntegrations.map(async (integration) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(integration.config.webhookUrl!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...integration.config.headers,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timeout)

        const responseText = await response.text()

        // Log the webhook delivery
        await db.insert(webhookLogs).values({
          integrationId: integration.id,
          event,
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status,
          response: responseText.slice(0, 500),
        })

        // Update last triggered timestamp
        await db
          .update(integrations)
          .set({ lastTriggered: new Date() })
          .where(eq(integrations.id, integration.id))

        return { success: response.ok, integrationId: integration.id }
      } catch (error) {
        // Log the failure
        await db.insert(webhookLogs).values({
          integrationId: integration.id,
          event,
          status: 'failed',
          response: error instanceof Error ? error.message : 'Network error',
        })

        return { success: false, integrationId: integration.id }
      }
    })

    // Wait for all webhooks to complete (or fail)
    await Promise.allSettled(webhookPromises)
  } catch (error) {
    console.error('Error triggering webhooks:', error)
  }
}
