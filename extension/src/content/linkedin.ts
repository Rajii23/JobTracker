export const getLinkedInJobDetails = () => {
    if (!window.location.hostname.includes('linkedin.com')) return null;

    // Try multiple selectors as LinkedIn classes change often
    const title =
        document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim() ||
        document.querySelector('h1.top-card-layout__title')?.textContent?.trim() ||
        document.querySelector('.jobs-unified-top-card__job-title')?.textContent?.trim();

    const company =
        document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim() ||
        document.querySelector('a.top-card-layout__card-url')?.textContent?.trim() ||
        document.querySelector('.jobs-unified-top-card__company-name')?.textContent?.trim();

    const location =
        document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim() ||
        document.querySelector('span.top-card-layout__first-sub-line')?.textContent?.trim() ||
        document.querySelector('.jobs-unified-top-card__bullet')?.textContent?.trim();

    const jdText =
        document.querySelector('.jobs-description__content')?.textContent?.trim() ||
        document.querySelector('.show-more-less-html__markup')?.textContent?.trim();

    if (title && company) {
        return {
            title,
            company,
            location: location || '',
            jdText: jdText || '',
            description: jdText || '', // Map to description for consistency
            url: window.location.href,
            source: 'linkedin',
            salary: '' // LinkedIn often hides this or puts it in unstructured text
        };
    }
    return null;
};
