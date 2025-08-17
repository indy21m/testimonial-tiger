import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { forms } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)

export const domainRouter = createTRPCRouter({
  setCustomDomain: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        domain: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, 'Invalid domain format').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if form belongs to user
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, ctx.userId)),
      })

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' })
      }

      // If removing domain
      if (!input.domain) {
        const updated = await ctx.db
          .update(forms)
          .set({
            customDomain: null,
            customDomainVerified: false,
            updatedAt: new Date(),
          })
          .where(eq(forms.id, input.formId))
          .returning()

        return updated[0]
      }

      // Check if domain is already taken by another form
      const existingDomain = await ctx.db.query.forms.findFirst({
        where: eq(forms.customDomain, input.domain),
      })

      if (existingDomain && existingDomain.id !== input.formId) {
        throw new TRPCError({ 
          code: 'CONFLICT', 
          message: 'This domain is already in use by another form' 
        })
      }

      // Update form with new domain (unverified)
      const updated = await ctx.db
        .update(forms)
        .set({
          customDomain: input.domain,
          customDomainVerified: false,
          updatedAt: new Date(),
        })
        .where(eq(forms.id, input.formId))
        .returning()

      return updated[0]
    }),

  verifyDomain: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, ctx.userId)),
      })

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' })
      }

      if (!form.customDomain) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'No custom domain set for this form' 
        })
      }

      // Generate verification token (form ID is used as token for simplicity)
      const verificationToken = `testimonial-tiger-verify=${input.formId}`

      try {
        // Check TXT records for verification
        const txtRecords = await resolveTxt(`_testimonial-tiger.${form.customDomain}`)
        
        const isVerified = txtRecords.some(record => 
          record.some(text => text === verificationToken)
        )

        if (!isVerified) {
          return {
            verified: false,
            message: 'Verification TXT record not found',
            instructions: {
              type: 'TXT',
              name: '_testimonial-tiger',
              value: verificationToken,
            },
          }
        }

        // Update verification status
        await ctx.db
          .update(forms)
          .set({
            customDomainVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(forms.id, input.formId))

        return {
          verified: true,
          message: 'Domain verified successfully',
        }

      } catch {
        // DNS lookup failed - domain might not exist or no TXT records
        return {
          verified: false,
          message: 'Could not verify domain. Please ensure DNS records are configured correctly.',
          instructions: {
            type: 'TXT',
            name: '_testimonial-tiger',
            value: verificationToken,
          },
        }
      }
    }),

  getDomainStatus: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, ctx.userId)),
      })

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' })
      }

      if (!form.customDomain) {
        return {
          hasDomain: false,
        }
      }

      return {
        hasDomain: true,
        domain: form.customDomain,
        verified: form.customDomainVerified,
        verificationToken: `testimonial-tiger-verify=${input.formId}`,
      }
    }),
})