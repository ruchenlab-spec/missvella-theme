/**
 * Cross-product color group swatches.
 *
 * The swatches themselves are rendered server side (see
 * `snippets/color-group-swatches.liquid`). Each swatch links to the product
 * page of one colour, so every colour keeps its own URL, its own first image
 * and its own social/Pinterest landing page.
 *
 * This script adds two behaviours:
 * 1. The currently selected size is carried over to the target product
 *    (`?variant=` of the matching size on the target product).
 * 2. Hovering a swatch previews the first image of that colour in the main
 *    product media area.
 */

const SIZE_OPTION_NAME_PATTERN = /^(size|尺寸)[\s\-_–—]/i;
const SELECTOR_CHECKED_RADIO =
  'variant-picker input[type="radio"]:checked, [data-mv-option-kind="size"] input[type="radio"]:checked';

/**
 * Returns the size label the shopper currently selected, if any.
 * @returns {string|null}
 */
function getSelectedSize() {
  for (const radio of document.querySelectorAll(SELECTOR_CHECKED_RADIO)) {
    const name = radio.getAttribute('name') || '';
    if (!SIZE_OPTION_NAME_PATTERN.test(name)) continue;
    const value = (radio.value || '').trim();
    if (value) return value;
  }

  // Fallback: resolve the size from the `?variant=` parameter.
  const variantId = new URLSearchParams(window.location.search).get('variant');
  if (!variantId) return null;

  for (const radio of document.querySelectorAll('variant-picker input[type="radio"][data-variant-id]')) {
    if (radio.getAttribute('data-variant-id') !== variantId) continue;
    const name = radio.getAttribute('name') || '';
    if (!SIZE_OPTION_NAME_PATTERN.test(name)) continue;
    const value = (radio.value || '').trim();
    if (value) return value;
  }

  return null;
}

/**
 * Reads the size map rendered on the swatch link.
 * @param {HTMLElement} link - The swatch link.
 * @returns {Array<{size: string, variant: number}>}
 */
function getSizeMap(link) {
  try {
    const parsed = JSON.parse(link.getAttribute('data-sizes') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/**
 * Builds the target URL, carrying over the selected size when possible.
 * @param {HTMLElement} link - The swatch link.
 * @param {string|null} size - The selected size label.
 * @returns {string|null} The URL to navigate to, or null to use the default.
 */
function buildTargetUrl(link, size) {
  if (!size) return null;

  const sizeMap = getSizeMap(link);
  if (!sizeMap.length) return null;

  const normalizedSize = size.toLowerCase();
  const match = sizeMap.find((entry) => (entry.size || '').trim().toLowerCase() === normalizedSize);
  if (!match || !match.variant) return null;

  const url = new URL(link.getAttribute('href'), window.location.origin);
  url.searchParams.set('variant', String(match.variant));
  return url.toString();
}

/**
 * Returns the main product image, used for the hover preview.
 * @returns {HTMLImageElement|null}
 */
function getMainMediaImage() {
  return document.querySelector('.product-media img');
}

let previewedImage = null;
let previewRestoreState = null;

/**
 * Temporarily shows the first image of another colour.
 * @param {HTMLElement} link - The swatch link.
 */
function previewColorImage(link) {
  const previewSrc = link.getAttribute('data-preview-src');
  if (!previewSrc) return;

  const image = getMainMediaImage();
  if (!image || image.src === previewSrc) return;

  previewRestoreState = {
    image,
    src: image.getAttribute('src'),
    srcset: image.getAttribute('srcset'),
  };

  image.removeAttribute('srcset');
  image.setAttribute('src', previewSrc);
  previewedImage = image;
}

/**
 * Restores the main product image after the hover preview.
 */
function restoreColorImage() {
  if (!previewRestoreState) return;

  const { image, src, srcset } = previewRestoreState;
  if (src) image.setAttribute('src', src);
  else image.removeAttribute('src');
  if (srcset) image.setAttribute('srcset', srcset);

  previewRestoreState = null;
  previewedImage = null;
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-color-group-link]');
  if (!link) return;

  const targetUrl = buildTargetUrl(link, getSelectedSize());
  if (!targetUrl) return;

  event.preventDefault();
  window.location.assign(targetUrl);
});

document.addEventListener('pointerover', (event) => {
  const link = event.target.closest('a[data-color-group-link]');
  if (!link) return;
  previewColorImage(link);
});

document.addEventListener('pointerout', (event) => {
  const link = event.target.closest('a[data-color-group-link]');
  if (!link) return;
  if (previewedImage && event.relatedTarget && previewedImage.contains(event.relatedTarget)) return;
  restoreColorImage();
});

window.addEventListener('pagehide', restoreColorImage);
