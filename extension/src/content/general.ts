export const getGeneralJobDetails = () => {
    // Basic heuristics to find job details on any page

    // 1. Title: Usually the largest H1 or contains "Job" or follows pattern
    const h1s = Array.from(document.querySelectorAll('h1'));
    let title = '';
    if (h1s.length > 0) {
        // Find visible H1, or first H1
        const visibleH1 = h1s.find(h => h.offsetParent !== null);
        title = visibleH1 ? visibleH1.textContent?.trim() || '' : h1s[0].textContent?.trim() || '';
    }

    // 2. Company: Often near the title, or in certain meta tags
    const metaCompany = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    let company = metaCompany || '';

    // If metaCompany is generic (like "Job Search"), try to find it in the body
    if (!company || company.toLowerCase().includes('job')) {
        // Look for common patterns or just use the domain as a fallback
        company = window.location.hostname.replace('www.', '').split('.')[0];
        company = company.charAt(0).toUpperCase() + company.slice(1);
    }

    // 3. Location: Heuristics or meta tags
    let location = '';

    // 4. Description: Look for long text blocks or specific semantic tags
    const article = document.querySelector('article');
    const descriptionText = article ? article.textContent?.trim() : '';

    return {
        title: title || 'Job Title Not Found',
        company: company || 'Company Not Found',
        location: location || '',
        description: descriptionText || document.body.innerText.substring(0, 500) + '...',
        url: window.location.href,
        salary: '',
        source: 'general'
    };
};
