'use server'

export async function checkUrlEmbeddable(url: string): Promise<{ embeddable: boolean }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const xFrameOptions = res.headers.get('x-frame-options')
    const csp = res.headers.get('content-security-policy')
    
    if (xFrameOptions && (xFrameOptions.toLowerCase() === 'deny' || xFrameOptions.toLowerCase() === 'sameorigin')) {
      return { embeddable: false }
    }
    
    if (csp && csp.toLowerCase().includes('frame-ancestors')) {
       return { embeddable: false }
    }
    
    return { embeddable: true }
  } catch {
    return { embeddable: false }
  }
}
