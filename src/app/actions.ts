'use server'

export async function checkUrlEmbeddable(url: string): Promise<{ embeddable: boolean }> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
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
