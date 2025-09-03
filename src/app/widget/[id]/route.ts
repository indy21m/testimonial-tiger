import { NextRequest, NextResponse } from 'next/server'
import { db, widgets, testimonials } from '@/server/db'
import { eq, and, desc, gte, inArray, sql } from 'drizzle-orm'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    // Handle both with and without .js extension
    const widgetId = params.id.replace('.js', '')
    
    // Get widget configuration
    const widget = await db.query.widgets.findFirst({
      where: eq(widgets.id, widgetId),
    })

    if (!widget) {
      console.error(`Widget not found for ID: ${widgetId}`)
      return new NextResponse('// Widget not found', { 
        status: 404,
        headers: {
          'Content-Type': 'application/javascript',
        }
      })
    }

    // Check domain whitelist
    const referer = request.headers.get('referer')
    if (widget.allowedDomains && widget.allowedDomains.length > 0 && referer) {
      try {
        const domain = new URL(referer).hostname
        if (!widget.allowedDomains.includes(domain)) {
          return new NextResponse('Domain not allowed', { status: 403 })
        }
      } catch {
        // Invalid referer URL
        return new NextResponse('Invalid referer', { status: 403 })
      }
    }

    let widgetTestimonials = []
    
    // Check if specific testimonials are selected
    if (widget.config.filters.selectedTestimonialIds && widget.config.filters.selectedTestimonialIds.length > 0) {
      // Fetch only selected testimonials
      const selectedTestimonials = await db.query.testimonials.findMany({
        where: and(
          eq(testimonials.status, 'approved'),
          inArray(testimonials.id, widget.config.filters.selectedTestimonialIds)
        ),
      })
      
      // Sort testimonials according to custom order if provided
      if (widget.config.filters.testimonialOrder && widget.config.filters.testimonialOrder.length > 0) {
        const orderMap = new Map(widget.config.filters.testimonialOrder.map((id, index) => [id, index]))
        widgetTestimonials = selectedTestimonials.sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999
          const orderB = orderMap.get(b.id) ?? 999
          return orderA - orderB
        })
      } else {
        widgetTestimonials = selectedTestimonials
      }
    } else {
      // Fall back to filter-based selection
      const conditions = [eq(testimonials.status, 'approved')]
      
      if (widget.config.filters.formIds && widget.config.filters.formIds.length > 0) {
        conditions.push(inArray(testimonials.formId, widget.config.filters.formIds))
      }
      
      if (widget.config.filters.onlyFeatured) {
        conditions.push(eq(testimonials.featured, true))
      }
      
      if (widget.config.filters.minRating) {
        conditions.push(gte(testimonials.rating, widget.config.filters.minRating))
      }

      const limit = widget.config.filters.maxItems || 20

      widgetTestimonials = await db.query.testimonials.findMany({
        where: and(...conditions),
        orderBy: [desc(testimonials.submittedAt)],
        limit,
      })
    }

    // Track impression (non-blocking)
    db.update(widgets)
      .set({ impressions: sql`${widgets.impressions} + 1` })
      .where(eq(widgets.id, widget.id))
      .then(() => {})
      .catch(console.error)

    // Generate JavaScript code
    const js = generateWidgetJS(widget, widgetTestimonials)

    return new NextResponse(js, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Widget error:', error)
    // Return a simple JavaScript that logs the error
    const errorJs = `console.error('Widget Error:', '${error}');`
    return new NextResponse(errorJs, { 
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

function generateWidgetJS(widget: any, testimonials: any[]) {
  const { config } = widget
  const widgetId = widget.id

  // Generate CSS
  const css = `
    .tt-widget-${widgetId} {
      font-family: ${config.styling.fontFamily}, sans-serif;
      color: ${config.styling.textColor};
      --tt-primary: ${config.styling.primaryColor};
      --tt-bg: ${config.styling.backgroundColor};
      --tt-text: ${config.styling.textColor};
      --tt-border: ${config.styling.borderColor};
      --tt-radius: ${config.styling.borderRadius};
    }
    
    .tt-widget-${widgetId} * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    .tt-widget-${widgetId} .tt-testimonial {
      background: var(--tt-bg);
      border: 1px solid var(--tt-border);
      border-radius: var(--tt-radius);
      padding: ${config.styling.layout === 'compact' ? '12px' : config.styling.layout === 'spacious' ? '24px' : '16px'};
      ${config.styling.shadow === 'sm' ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.12);' : 
        config.styling.shadow === 'md' ? 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);' : 
        config.styling.shadow === 'lg' ? 'box-shadow: 0 10px 15px rgba(0,0,0,0.1);' : ''}
    }
    
    .tt-widget-${widgetId} .tt-rating {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
    }
    
    .tt-widget-${widgetId} .tt-star {
      width: 16px;
      height: 16px;
      fill: #FFC107;
    }
    
    .tt-widget-${widgetId} .tt-star.empty {
      fill: #E0E0E0;
    }
    
    .tt-widget-${widgetId} .tt-content {
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .tt-widget-${widgetId} .tt-customer {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .tt-widget-${widgetId} .tt-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #E0E0E0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .tt-widget-${widgetId} .tt-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .tt-widget-${widgetId} .tt-customer-info {
      flex: 1;
      min-width: 0;
    }
    
    .tt-widget-${widgetId} .tt-customer-name {
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .tt-widget-${widgetId} .tt-customer-company {
      font-size: 14px;
      opacity: 0.7;
    }
    
    /* Widget type specific styles */
    .tt-widget-${widgetId}.tt-wall {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .tt-widget-${widgetId}.tt-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    @media (max-width: 768px) {
      .tt-widget-${widgetId}.tt-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .tt-widget-${widgetId}.tt-carousel {
      position: relative;
      overflow: hidden;
    }
    
    .tt-widget-${widgetId}.tt-carousel .tt-carousel-inner {
      display: flex;
      transition: transform 0.3s ease;
    }
    
    .tt-widget-${widgetId}.tt-carousel .tt-testimonial {
      flex: 0 0 100%;
    }
    
    .tt-widget-${widgetId}.tt-carousel .tt-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: white;
      border: 1px solid var(--tt-border);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .tt-widget-${widgetId}.tt-carousel .tt-nav.prev {
      left: 16px;
    }
    
    .tt-widget-${widgetId}.tt-carousel .tt-nav.next {
      right: 16px;
    }
    
    .tt-widget-${widgetId}.tt-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--tt-bg);
      border: 1px solid var(--tt-border);
      border-radius: 100px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 600;
    }
  `

  // Generate HTML
  let html = ''
  
  switch (widget.type) {
    case 'wall':
      html = `<div class="tt-widget-${widgetId} tt-wall">${testimonials.map(t => renderTestimonial(t, config)).join('')}</div>`
      break
      
    case 'grid':
      html = `<div class="tt-widget-${widgetId} tt-grid">${testimonials.slice(0, config.display.itemsPerPage || 9).map(t => renderTestimonial(t, config)).join('')}</div>`
      break
      
    case 'carousel':
      html = `
        <div class="tt-widget-${widgetId} tt-carousel">
          <div class="tt-carousel-inner">
            ${testimonials.map(t => renderTestimonial(t, config)).join('')}
          </div>
          ${testimonials.length > 1 ? `
            <div class="tt-nav prev">‹</div>
            <div class="tt-nav next">›</div>
          ` : ''}
        </div>
      `
      break
      
    case 'single':
      html = testimonials[0] ? `<div class="tt-widget-${widgetId}">${renderTestimonial(testimonials[0], config)}</div>` : ''
      break
      
    case 'badge':
      const avgRating = testimonials.length > 0 
        ? testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) / testimonials.length
        : 0
      html = `
        <div class="tt-widget-${widgetId} tt-badge">
          <div class="tt-rating">
            ${[1,2,3,4,5].map(i => `
              <svg class="tt-star ${i <= Math.round(avgRating) ? '' : 'empty'}" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            `).join('')}
          </div>
          <span>${avgRating.toFixed(1)} (${testimonials.length} reviews)</span>
        </div>
      `
      break
  }

  // Generate JavaScript
  const js = `console.log('Testimonial Tiger Widget Script Loaded - ID: ${widgetId}');
(function() {
  console.log('Testimonial Tiger Widget IIFE executing for ID: ${widgetId}');
  
  // Function to initialize the widget
  function initWidget() {
    console.log('Attempting to initialize widget for ID: ${widgetId}');
    
    // Add styles if not already added
    if (!document.getElementById('tt-styles-${widgetId}')) {
      var style = document.createElement('style');
      style.id = 'tt-styles-${widgetId}';
      style.textContent = \`${css}\`;
      document.head.appendChild(style);
      console.log('Styles added for widget ${widgetId}');
    }
    
    // Find container
    var container = document.getElementById('tt-widget-${widgetId}');
    console.log('Container search result:', container);
    
    if (container) {
      container.innerHTML = \`${html.replace(/\`/g, '\\`')}\`;
      console.log('Widget HTML injected successfully for ${widgetId}');
    
    // Initialize carousel if needed
    ${widget.type === 'carousel' && testimonials.length > 1 ? `
      var currentSlide = 0;
      var slides = container.querySelectorAll('.tt-testimonial');
      var inner = container.querySelector('.tt-carousel-inner');
      var prevBtn = container.querySelector('.tt-nav.prev');
      var nextBtn = container.querySelector('.tt-nav.next');
      
      function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        inner.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          showSlide(currentSlide - 1);
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          showSlide(currentSlide + 1);
        });
      }
      
      // Auto-play
      setInterval(function() {
        showSlide(currentSlide + 1);
      }, 5000);
    ` : ''}
      return true; // Widget initialized successfully
    } else {
      console.log('Container not found for widget ${widgetId}');
      return false; // Container not found
    }
  }
  
  // Try to initialize immediately
  if (initWidget()) {
    console.log('Widget initialized immediately');
  } else {
    // If container not found, set up retry mechanism
    console.log('Container not found immediately, setting up retry mechanism');
    var attempts = 0;
    var maxAttempts = 20;
    var retryInterval = setInterval(function() {
      attempts++;
      console.log('Retry attempt ' + attempts + ' for widget ${widgetId}');
      
      if (initWidget()) {
        console.log('Widget initialized after ' + attempts + ' attempts');
        clearInterval(retryInterval);
      } else if (attempts >= maxAttempts) {
        console.error('Failed to find container after ' + maxAttempts + ' attempts for widget ${widgetId}');
        clearInterval(retryInterval);
      }
    }, 500); // Try every 500ms
  }
  
  // Also try on DOMContentLoaded if document is still loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOMContentLoaded - attempting to initialize widget ${widgetId}');
      initWidget();
    });
  }
  
  // Also try on window load as a final fallback
  if (window.addEventListener) {
    window.addEventListener('load', function() {
      console.log('Window loaded - final attempt to initialize widget ${widgetId}');
      initWidget();
    });
  }
})();
  `

  return js
}

function renderTestimonial(testimonial: any, config: any): string {
  const truncateLength = config.display.truncateLength || 200
  const showReadMore = config.display.showReadMore !== false
  const needsTruncation = testimonial.content.length > truncateLength
  const testimonialId = `tt-testimonial-${testimonial.id}`
  
  const truncatedContent = needsTruncation
    ? testimonial.content.slice(0, truncateLength) + '...'
    : testimonial.content
  
  // Generate initials for fallback avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')
    }
    return name.slice(0, 2).toUpperCase()
  }
  
  const fallbackAvatarStyle = config.styling.fallbackAvatar || {
    type: 'initials',
    backgroundColor: '#3b82f6',
    textColor: '#FFFFFF'
  }
  
  const renderAvatar = () => {
    if (testimonial.customerPhoto) {
      return `<img src="${escapeHtml(testimonial.customerPhoto)}" alt="${escapeHtml(testimonial.customerName)}" />`
    }
    
    if (fallbackAvatarStyle.type === 'placeholder' && fallbackAvatarStyle.placeholderUrl) {
      return `<img src="${escapeHtml(fallbackAvatarStyle.placeholderUrl)}" alt="${escapeHtml(testimonial.customerName)}" />`
    }
    
    // Default to initials
    const initials = getInitials(testimonial.customerName)
    return `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${fallbackAvatarStyle.backgroundColor || '#3b82f6'};
        color: ${fallbackAvatarStyle.textColor || '#FFFFFF'};
        font-weight: 600;
        font-size: 16px;
        border-radius: 50%;
      ">
        ${initials}
      </div>
    `
  }

  return `
    <div class="tt-testimonial" data-testimonial-id="${testimonialId}">
      ${config.display.showRating && testimonial.rating ? `
        <div class="tt-rating">
          ${[1,2,3,4,5].map(i => `
            <svg class="tt-star ${i <= testimonial.rating ? '' : 'empty'}" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          `).join('')}
        </div>
      ` : ''}
      
      ${testimonial.videoUrl ? `
        <div class="tt-video" style="margin-bottom: 16px;">
          <video controls style="width: 100%; border-radius: 8px;">
            <source src="${escapeHtml(testimonial.videoUrl)}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      ` : ''}
      
      <div class="tt-content">
        <span class="tt-content-text">${escapeHtml(truncatedContent)}</span>
        ${needsTruncation ? `
          <span class="tt-content-full" style="display: none;">${escapeHtml(testimonial.content)}</span>
          ${showReadMore ? `
            <button class="tt-read-more" style="
              background: none;
              border: none;
              color: ${config.styling.primaryColor};
              cursor: pointer;
              font-size: inherit;
              padding: 0;
              margin-left: 4px;
              text-decoration: underline;
            " onclick="
              var testimonial = this.closest('[data-testimonial-id]');
              var textEl = testimonial.querySelector('.tt-content-text');
              var fullEl = testimonial.querySelector('.tt-content-full');
              if (fullEl.style.display === 'none') {
                textEl.style.display = 'none';
                fullEl.style.display = 'inline';
                this.textContent = 'Read Less';
              } else {
                textEl.style.display = 'inline';
                fullEl.style.display = 'none';
                this.textContent = 'Read More';
              }
            ">Read More</button>
          ` : ''}
        ` : ''}
      </div>
      
      ${config.display.showDate && testimonial.submittedAt ? `
        <div class="tt-date" style="
          font-size: 12px;
          opacity: 0.6;
          margin-top: 8px;
        ">
          ${new Date(testimonial.submittedAt).toLocaleDateString()}
        </div>
      ` : ''}
      
      <div class="tt-customer">
        ${config.display.showPhoto ? `
          <div class="tt-avatar">
            ${renderAvatar()}
          </div>
        ` : ''}
        
        <div class="tt-customer-info">
          <div class="tt-customer-name">${escapeHtml(testimonial.customerName)}</div>
          ${config.display.showCompany && testimonial.customerCompany ? `
            <div class="tt-customer-company">${escapeHtml(testimonial.customerCompany)}</div>
          ` : ''}
        </div>
      </div>
    </div>
  `
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m] || m)
}