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
        },
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
    if (
      widget.config.filters.selectedTestimonialIds &&
      widget.config.filters.selectedTestimonialIds.length > 0
    ) {
      // Fetch only selected testimonials
      const selectedTestimonials = await db.query.testimonials.findMany({
        where: and(
          eq(testimonials.status, 'approved'),
          inArray(testimonials.id, widget.config.filters.selectedTestimonialIds)
        ),
      })

      // Sort testimonials according to custom order if provided
      if (
        widget.config.filters.testimonialOrder &&
        widget.config.filters.testimonialOrder.length > 0
      ) {
        const orderMap = new Map(
          widget.config.filters.testimonialOrder.map((id, index) => [id, index])
        )
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

      if (
        widget.config.filters.formIds &&
        widget.config.filters.formIds.length > 0
      ) {
        conditions.push(
          inArray(testimonials.formId, widget.config.filters.formIds)
        )
      }

      if (widget.config.filters.onlyFeatured) {
        conditions.push(eq(testimonials.featured, true))
      }

      if (widget.config.filters.minRating) {
        conditions.push(
          gte(testimonials.rating, widget.config.filters.minRating)
        )
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
      },
    })
  }
}

function generateWidgetJS(widget: any, testimonials: any[]) {
  const { config } = widget
  const widgetId = widget.id

  // Generate CSS with !important to prevent host site overrides
  const css = `
    .tt-widget-${widgetId} {
      font-family: ${config.styling.fontFamily}, sans-serif !important;
      color: ${config.styling.textColor} !important;
      --tt-primary: ${config.styling.primaryColor};
      --tt-bg: ${config.styling.backgroundColor};
      --tt-text: ${config.styling.textColor};
      --tt-border: ${config.styling.borderColor};
      --tt-radius: ${config.styling.borderRadius};
    }

    .tt-widget-${widgetId} * {
      box-sizing: border-box !important;
    }

    .tt-widget-${widgetId} .tt-testimonial {
      background: var(--tt-bg) !important;
      border: 1px solid var(--tt-border) !important;
      border-radius: var(--tt-radius) !important;
      padding: ${config.styling.layout === 'compact' ? '12px' : config.styling.layout === 'spacious' ? '24px' : '16px'} !important;
      margin: 0 !important;
      ${
        config.styling.shadow === 'sm'
          ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;'
          : config.styling.shadow === 'md'
            ? 'box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;'
            : config.styling.shadow === 'lg'
              ? 'box-shadow: 0 10px 15px rgba(0,0,0,0.1) !important;'
              : 'box-shadow: none !important;'
      }
    }

    .tt-widget-${widgetId} .tt-rating {
      display: flex !important;
      gap: 4px !important;
      margin-bottom: 12px !important;
      padding: 0 !important;
      background: transparent !important;
    }

    .tt-widget-${widgetId} .tt-star {
      width: 16px !important;
      height: 16px !important;
      fill: #FFC107 !important;
      background: transparent !important;
    }

    .tt-widget-${widgetId} .tt-star.empty {
      fill: #E0E0E0 !important;
    }

    .tt-widget-${widgetId} .tt-content {
      line-height: 1.6 !important;
      margin-bottom: 16px !important;
      padding: 0 !important;
      background: transparent !important;
      color: var(--tt-text) !important;
    }

    .tt-widget-${widgetId} .tt-customer {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .tt-widget-${widgetId} .tt-avatar {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      background: #E0E0E0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
      overflow: hidden !important;
    }

    .tt-widget-${widgetId} .tt-avatar img {
      width: 100% !important;
      height: 100% !important;
      border-radius: 50% !important;
      object-fit: cover !important;
    }

    .tt-widget-${widgetId} .tt-customer-info {
      flex: 1 !important;
      min-width: 0 !important;
      background: transparent !important;
    }

    .tt-widget-${widgetId} .tt-customer-name {
      font-weight: 600 !important;
      margin-bottom: 2px !important;
      color: var(--tt-text) !important;
      background: transparent !important;
    }

    .tt-widget-${widgetId} .tt-customer-company {
      font-size: 14px !important;
      opacity: 0.7 !important;
      color: var(--tt-text) !important;
      background: transparent !important;
    }
    
    /* Widget type specific styles - Masonry layout using CSS columns */
    .tt-widget-${widgetId}.tt-wall {
      column-count: 3;
      column-gap: 16px;
    }

    .tt-widget-${widgetId}.tt-wall .tt-testimonial {
      break-inside: avoid;
      margin-bottom: 16px;
      display: inline-block;
      width: 100%;
    }

    @media (max-width: 1024px) {
      .tt-widget-${widgetId}.tt-wall {
        column-count: 2;
      }
    }

    @media (max-width: 640px) {
      .tt-widget-${widgetId}.tt-wall {
        column-count: 1;
      }
    }

    .tt-widget-${widgetId}.tt-grid {
      column-count: 3;
      column-gap: 16px;
    }

    .tt-widget-${widgetId}.tt-grid .tt-testimonial {
      break-inside: avoid;
      margin-bottom: 16px;
      display: inline-block;
      width: 100%;
    }

    @media (max-width: 1024px) {
      .tt-widget-${widgetId}.tt-grid {
        column-count: 2;
      }
    }

    @media (max-width: 640px) {
      .tt-widget-${widgetId}.tt-grid {
        column-count: 1;
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
      html = `<div class="tt-widget-${widgetId} tt-wall">${testimonials.map((t) => renderTestimonial(t, config)).join('')}</div>`
      break

    case 'grid':
      html = `<div class="tt-widget-${widgetId} tt-grid">${testimonials
        .slice(0, config.display.itemsPerPage || 9)
        .map((t) => renderTestimonial(t, config))
        .join('')}</div>`
      break

    case 'carousel':
      html = `
        <div class="tt-widget-${widgetId} tt-carousel">
          <div class="tt-carousel-inner">
            ${testimonials.map((t) => renderTestimonial(t, config)).join('')}
          </div>
          ${
            testimonials.length > 1
              ? `
            <div class="tt-nav prev">‹</div>
            <div class="tt-nav next">›</div>
          `
              : ''
          }
        </div>
      `
      break

    case 'single':
      html = testimonials[0]
        ? `<div class="tt-widget-${widgetId}">${renderTestimonial(testimonials[0], config)}</div>`
        : ''
      break

    case 'badge':
      const avgRating =
        testimonials.length > 0
          ? testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) /
            testimonials.length
          : 0
      html = `
        <div class="tt-widget-${widgetId} tt-badge">
          <div class="tt-rating">
            ${[1, 2, 3, 4, 5]
              .map(
                (i) => `
              <svg class="tt-star ${i <= Math.round(avgRating) ? '' : 'empty'}" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            `
              )
              .join('')}
          </div>
          <span>${avgRating.toFixed(1)} (${testimonials.length} reviews)</span>
        </div>
      `
      break
  }

  // Generate JavaScript
  const js = `console.log('[Testimonial Tiger] Widget script loaded - ID: ${widgetId}');
(function() {
  console.log('[Testimonial Tiger] Initializing widget ${widgetId}');
  
  var widgetInitialized = false;
  var observerActive = false;
  
  // Function to initialize the widget
  function initWidget() {
    if (widgetInitialized) {
      console.log('[Testimonial Tiger] Widget already initialized');
      return true;
    }
    
    console.log('[Testimonial Tiger] Attempting to initialize widget ${widgetId}');
    
    // Add styles if not already added
    if (!document.getElementById('tt-styles-${widgetId}')) {
      var style = document.createElement('style');
      style.id = 'tt-styles-${widgetId}';
      style.textContent = \`${css}\`;
      
      // Try to add to head, fallback to body if head not available
      if (document.head) {
        document.head.appendChild(style);
      } else if (document.body) {
        document.body.appendChild(style);
      } else {
        console.warn('[Testimonial Tiger] Neither head nor body available for styles');
        return false;
      }
      console.log('[Testimonial Tiger] Styles added');
    }
    
    // Find container - try multiple methods
    var container = document.getElementById('tt-widget-${widgetId}');
    
    // If not found, try querySelector as backup
    if (!container) {
      container = document.querySelector('#tt-widget-${widgetId}');
    }
    
    // If still not found, try with escaped ID for special cases
    if (!container) {
      try {
        container = document.querySelector('[id="tt-widget-${widgetId}"]');
      } catch(e) {
        console.log('[Testimonial Tiger] querySelector with attribute failed:', e);
      }
    }
    
    console.log('[Testimonial Tiger] Container search result:', container);
    
    if (container) {
      // Check if container already has content (avoid re-initialization)
      if (container.querySelector('.tt-widget-${widgetId}')) {
        console.log('[Testimonial Tiger] Widget already rendered');
        widgetInitialized = true;
        return true;
      }
      
      try {
        container.innerHTML = \`${html.replace(/\`/g, '\\`')}\`;
        console.log('[Testimonial Tiger] Widget HTML injected successfully');
        widgetInitialized = true;
        
        // Initialize carousel if needed
        ${
          widget.type === 'carousel' && testimonials.length > 1
            ? `
        setTimeout(function() {
          var currentSlide = 0;
          var slides = container.querySelectorAll('.tt-testimonial');
          var inner = container.querySelector('.tt-carousel-inner');
          var prevBtn = container.querySelector('.tt-nav.prev');
          var nextBtn = container.querySelector('.tt-nav.next');
          
          function showSlide(index) {
            if (inner) {
              currentSlide = (index + slides.length) % slides.length;
              inner.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
            }
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
          if (inner && slides.length > 1) {
            setInterval(function() {
              showSlide(currentSlide + 1);
            }, 5000);
          }
        }, 100);
        `
            : ''
        }
        
        return true;
      } catch(e) {
        console.error('[Testimonial Tiger] Error injecting HTML:', e);
        return false;
      }
    } else {
      console.log('[Testimonial Tiger] Container not found');
      return false;
    }
  }
  
  // WordPress-specific: Create container if it doesn't exist but script is in body
  function createContainerIfNeeded() {
    if (!document.getElementById('tt-widget-${widgetId}')) {
      console.log('[Testimonial Tiger] Container not found, checking for script tag');
      
      // Find our script tag
      var scripts = document.getElementsByTagName('script');
      var ourScript = null;
      
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.indexOf('widget/${widgetId}') > -1) {
          ourScript = scripts[i];
          break;
        }
      }
      
      if (ourScript) {
        console.log('[Testimonial Tiger] Found our script tag, creating container before it');
        var container = document.createElement('div');
        container.id = 'tt-widget-${widgetId}';
        ourScript.parentNode.insertBefore(container, ourScript);
        return true;
      }
    }
    return false;
  }
  
  // MutationObserver to watch for container being added
  function setupObserver() {
    if (observerActive || !window.MutationObserver) {
      return;
    }
    
    console.log('[Testimonial Tiger] Setting up MutationObserver');
    observerActive = true;
    
    var observer = new MutationObserver(function(mutations) {
      if (widgetInitialized) {
        observer.disconnect();
        return;
      }
      
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        
        // Check added nodes
        for (var j = 0; j < mutation.addedNodes.length; j++) {
          var node = mutation.addedNodes[j];
          
          // Check if the added node is our container
          if (node.id === 'tt-widget-${widgetId}') {
            console.log('[Testimonial Tiger] Container detected via MutationObserver');
            setTimeout(function() {
              if (initWidget()) {
                observer.disconnect();
              }
            }, 10);
            return;
          }
          
          // Check if the added node contains our container
          if (node.nodeType === 1 && node.querySelector) {
            var found = node.querySelector('#tt-widget-${widgetId}');
            if (found) {
              console.log('[Testimonial Tiger] Container found in added node');
              setTimeout(function() {
                if (initWidget()) {
                  observer.disconnect();
                }
              }, 10);
              return;
            }
          }
        }
      }
    });
    
    // Observe the entire document
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
    
    // Disconnect observer after 30 seconds to prevent memory leaks
    setTimeout(function() {
      if (observerActive && !widgetInitialized) {
        console.log('[Testimonial Tiger] Disconnecting observer after timeout');
        observer.disconnect();
        observerActive = false;
      }
    }, 30000);
  }
  
  // Main initialization logic
  function startInitialization() {
    // Try to create container if needed (WordPress edge case)
    createContainerIfNeeded();
    
    // Try to initialize immediately
    if (initWidget()) {
      console.log('[Testimonial Tiger] Widget initialized immediately');
      return;
    }
    
    // Set up MutationObserver for dynamic content
    if (document.body || document.documentElement) {
      setupObserver();
    }
    
    // Set up retry mechanism
    console.log('[Testimonial Tiger] Setting up retry mechanism');
    var attempts = 0;
    var maxAttempts = 30; // Increased for WordPress
    var retryInterval = setInterval(function() {
      attempts++;
      
      // Try to create container on each attempt for WordPress
      if (attempts % 5 === 0) {
        createContainerIfNeeded();
      }
      
      if (initWidget()) {
        console.log('[Testimonial Tiger] Widget initialized after ' + attempts + ' attempts');
        clearInterval(retryInterval);
      } else if (attempts >= maxAttempts) {
        console.warn('[Testimonial Tiger] Could not initialize after ' + maxAttempts + ' attempts');
        console.log('[Testimonial Tiger] Please ensure the container div with id "tt-widget-${widgetId}" exists');
        clearInterval(retryInterval);
        
        // Final attempt: try creating container one more time
        if (createContainerIfNeeded()) {
          setTimeout(initWidget, 100);
        }
      }
    }, 500);
  }
  
  // Start initialization based on document state
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Document is ready or almost ready
    startInitialization();
  } else {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', startInitialization);
  }
  
  // Also try on window load as WordPress sometimes needs this
  if (window.addEventListener) {
    window.addEventListener('load', function() {
      if (!widgetInitialized) {
        console.log('[Testimonial Tiger] Window load - attempting initialization');
        createContainerIfNeeded();
        initWidget();
      }
    });
  }
  
  // For WordPress Gutenberg blocks and other dynamic content
  if (typeof wp !== 'undefined' && wp.domReady) {
    wp.domReady(function() {
      console.log('[Testimonial Tiger] WordPress domReady fired');
      if (!widgetInitialized) {
        createContainerIfNeeded();
        initWidget();
      }
    });
  }
  
  // jQuery ready for WordPress sites using jQuery
  if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(function() {
      console.log('[Testimonial Tiger] jQuery ready fired');
      if (!widgetInitialized) {
        createContainerIfNeeded();
        initWidget();
      }
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
    textColor: '#FFFFFF',
  }

  const renderAvatar = () => {
    if (testimonial.customerPhoto) {
      return `<img src="${escapeHtml(testimonial.customerPhoto)}" alt="${escapeHtml(testimonial.customerName)}" />`
    }

    if (
      fallbackAvatarStyle.type === 'placeholder' &&
      fallbackAvatarStyle.placeholderUrl
    ) {
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
      ${
        config.display.showRating && testimonial.rating
          ? `
        <div class="tt-rating">
          ${[1, 2, 3, 4, 5]
            .map(
              (i) => `
            <svg class="tt-star ${i <= testimonial.rating ? '' : 'empty'}" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }
      
      ${
        testimonial.videoUrl
          ? `
        <div class="tt-video" style="margin-bottom: 16px;">
          <video controls style="width: 100%; border-radius: 8px;">
            <source src="${escapeHtml(testimonial.videoUrl)}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `
          : ''
      }
      
      <div class="tt-content">
        <span class="tt-content-text">${escapeHtml(truncatedContent)}</span>
        ${
          needsTruncation
            ? `
          <span class="tt-content-full" style="display: none;">${escapeHtml(testimonial.content)}</span>
          ${
            showReadMore
              ? `
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
          `
              : ''
          }
        `
            : ''
        }
      </div>
      
      ${
        config.display.showDate && testimonial.submittedAt
          ? `
        <div class="tt-date" style="
          font-size: 12px;
          opacity: 0.6;
          margin-top: 8px;
        ">
          ${new Date(testimonial.submittedAt).toLocaleDateString()}
        </div>
      `
          : ''
      }
      
      <div class="tt-customer">
        ${
          config.display.showPhoto
            ? `
          <div class="tt-avatar">
            ${renderAvatar()}
          </div>
        `
            : ''
        }
        
        <div class="tt-customer-info">
          <div class="tt-customer-name">${escapeHtml(testimonial.customerName)}</div>
          ${
            config.display.showCompany && testimonial.customerCompany
              ? `
            <div class="tt-customer-company">${escapeHtml(testimonial.customerCompany)}</div>
          `
              : ''
          }
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
  return text.replace(/[&<>"']/g, (m) => map[m] || m)
}
